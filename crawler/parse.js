#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { load as loadHTML } from "cheerio";
import { z } from "zod";

/** ===== 工具 ===== */
const text = ( s?: string | null ) => ( s || "" ).replace( /\s+/g, " " ).trim();
const moneyToNumber = ( s?: string | null ) => {
  if ( !s ) return null;
  const num = s.replace( /[^\d.,]/g, "" ).replace( /,/g, "" );
  return num ? Number( num ) : null;
};
const slugify = ( s: string ) =>
  text( s )
    .toLowerCase()
    .replace( /[\u0300-\u036f]/g, "" )
    .replace( /[^a-z0-9]+/g, "-" )
    .replace( /(^-|-$)/g, "" );

const htmlToText = ( html?: string | null ) => {
  if ( !html ) return "";
  // 简易去标签，保留换行
  return text(
    html
      .replace( /<br\s*\/?>/gi, "\n" )
      .replace( /<\/p>/gi, "\n" )
      .replace( /<\/li>/gi, "\n• " )
      .replace( /<[^>]+>/g, "" )
  );
};

/** ===== 你要的 Product 结构校验 ===== */
const ProductOutSchema = z.object( {
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  shortDescription: z.string().optional().default( "" ),
  productType: z.enum( [ "GIFT_CARD", "GAME_CARD", "DIGITAL_CODE" ] ).default( "GIFT_CARD" ),
  status: z.enum( [ "ACTIVE", "INACTIVE" ] ).default( "ACTIVE" ),
  images: z.array( z.string() ).default( [] ),
  sku: z.string().optional(),
  region: z.string().optional(),
  platform: z.string().optional(),
  basePrice: z.number().nullable(),
  salePrice: z.number().nullable(),
  currency: z.string().optional(),
  stock: z.number().default( 100 ),
  unlimited: z.boolean().default( false ),
  lowStockAlert: z.number().default( 10 ),
  autoDelivery: z.boolean().default( true ),
  deliveryTemplate: z.string().optional(),
  metadata: z.object( {
    denominations: z.array( z.object( { value: z.number(), currency: z.string().optional() } ) ).default( [] ),
    howToRedeem: z.array( z.string() ).default( [] ),
    terms: z.array( z.string() ).default( [] ),
  } ).default( { denominations: [], howToRedeem: [], terms: [] } ),
  tags: z.array( z.string() ).default( [] ),
  sortOrder: z.number().default( 1 ),
  createdAt: z.string(),
  updatedAt: z.string(),
  categoryId: z.string().default( "gift-cards" ),
  rating: z.number().nullable().optional(),
  reviewCount: z.number().nullable().optional(),
  soldCount: z.number().nullable().optional(),
} );

/** ===== 内部抓取结构（和你之前的一致） ===== */
const ParsedSchema = z.object( {
  url: z.string().optional(),
  slug: z.string().optional(),
  name: z.string(),
  sku: z.string().optional(),
  brand: z.string().optional(),
  mpn: z.string().optional(),
  region: z.string().optional(),
  currency: z.string().optional(),
  images: z.array( z.string() ).default( [] ),
  ogImage: z.string().optional(),
  descriptionHtml: z.string().optional(),
  guideHtml: z.string().optional(),
  offers: z.array( z.object( {
    id: z.string().nullable().optional(),
    name: z.string().optional(),
    price: z.number().nullable(),
  } ) ).default( [] ),
  aggregateRating: z.object( {
    ratingValue: z.number().optional(),
    ratingCount: z.number().optional(),
  } ).optional(),
  reviews: z.array( z.object( {
    author: z.string().optional(),
    rating: z.number().optional(),
    date: z.string().optional(),
    body: z.string().optional(),
  } ) ).default( [] ),
  related: z.array( z.object( {
    title: z.string(),
    href: z.string(),
  } ) ).default( [] ),
  supportedGames: z.array( z.object( {
    title: z.string(),
    href: z.string(),
  } ) ).default( [] ),
  hreflangs: z.array( z.object( {
    lang: z.string(), href: z.string()
  } ) ).default( [] ),
  canonical: z.string().optional(),
  platform: z.string().optional(),
  soldCount: z.number().optional(),
  hasInstant: z.boolean().optional(),
} );

/** ===== 核心解析函数：抓取原始页面元素 ===== */
export function parseSeagmProductRaw( html: string, url = "" ) {
  const $ = loadHTML( html );

  // 基本信息
  const name =
    text( $( "#Product_cover .info .name h1" ).first().text() ) ||
    text( $( "meta[property='og:title']" ).attr( "content" ) ) ||
    text( $( "title" ).text() ) ||
    "Untitled";

  // region
  const region =
    text( $( "#Product_cover .feature li .C b" ).first().text() ) ||
    text( $( "#Product_cover .feature li .C" ).first().text() ) ||
    undefined;

  // 平台（简单推断）
  const platformGuess = /playstation|psn/i.test( name ) ? "PlayStation"
    : /steam/i.test( name ) ? "Steam"
      : /xbox/i.test( name ) ? "Xbox"
        : /nintendo/i.test( name ) ? "Nintendo"
          : undefined;

  // 图片
  const cardImg = $( "#Product_cover .CardPic" ).attr( "src" );
  const ogImage = $( "meta[property='og:image']" ).attr( "content" );
  const moreIconImgs: string[] = [];
  $( "#SKU_list .SKU_type .img img, #related_items .img img, #supported_game .img img" ).each( ( _, el ) => {
    const src = $( el ).attr( "data-src" ) || $( el ).attr( "src" );
    if ( src ) moreIconImgs.push( src );
  } );
  const images = [ cardImg, ogImage, ...moreIconImgs ].filter( Boolean ) as string[];

  // hreflang & canonical
  const hreflangs: { lang: string; href: string }[] = [];
  $( "link[rel='alternate'][hreflang]" ).each( ( _, el ) => {
    hreflangs.push( { lang: $( el ).attr( "hreflang" )!, href: $( el ).attr( "href" )! } );
  } );
  const canonical = $( "link[rel='canonical']" ).attr( "href" );

  // JSON-LD（品牌、sku、mpn、评分等）
  let brand, sku, mpn, aggregateRating: { ratingValue?: number; ratingCount?: number } | undefined;
  $( "script[type='application/ld+json']" ).each( ( _, el ) => {
    try {
      const data = JSON.parse( $( el ).contents().text() );
      const d = Array.isArray( data ) ? data : [ data ];
      for ( const node of d ) {
        if ( node[ "@type" ] === "Product" ) {
          brand = node?.brand?.name || brand;
          sku = node?.sku?.toString() || sku;
          mpn = node?.mpn || mpn;
          if ( node.aggregateRating ) {
            const rv = Number( node.aggregateRating.ratingValue );
            const rc = Number( node.aggregateRating.ratingCount );
            aggregateRating = {
              ratingValue: isNaN( rv ) ? undefined : rv,
              ratingCount: isNaN( rc ) ? undefined : rc,
            };
          }
        }
      }
    } catch { }
  } );

  // 货币：尝试从页面检测；否则默认 MYR
  let currency = "MYR";
  const pageText = $.root().text();
  if ( /RM\s?\d/i.test( pageText ) ) currency = "MYR";
  else if ( /\bUSD?\$/.test( pageText ) || /\bUSD\b/i.test( pageText ) ) currency = "USD";
  else if ( /\bSGD\b/i.test( pageText ) ) currency = "SGD";

  // 面额/价格（SKU 列表）
  const offers: { id?: string | null; name?: string; price: number | null }[] = [];
  $( "#cardType li" ).each( ( _, li ) => {
    const $li = $( li );
    const id = $li.find( "input[type=radio]" ).attr( "value" ) ?? null;
    const name = text( $li.find( ".SKU_type .T .sku" ).text() ) || text( $li.find( ".SKU_type .T" ).text() );
    const priceText = text( $li.find( ".SKU_type .C .price b" ).text() ) || text( $li.find( ".price b" ).text() );
    offers.push( { id, name, price: moneyToNumber( priceText ) } );
  } );

  // 描述 & 指引（保留 HTML）
  const descriptionHtml = $( "#item_description article.docs" ).html()?.trim()
    || $( "#item_description" ).html()?.trim();
  const guideHtml = $( "#item_instruction article.docs" ).html()?.trim()
    || $( "#item_instruction" ).html()?.trim();

  // 相关&支持游戏
  const related: { title: string; href: string }[] = [];
  $( "#related_items .ItemList li a" ).each( ( _, a ) => {
    related.push( { title: text( $( a ).find( ".T .name" ).text() ), href: ( $( a ).attr( "href" ) || "" ).trim() } );
  } );
  const supportedGames: { title: string; href: string }[] = [];
  $( "#supported_game .ItemList li a" ).each( ( _, a ) => {
    supportedGames.push( { title: text( $( a ).find( ".T .name" ).text() ), href: ( $( a ).attr( "href" ) || "" ).trim() } );
  } );

  // 评论
  const reviews: { author?: string; rating?: number; date?: string; body?: string }[] = [];
  $( "#item_reviews .review_list > li" ).each( ( _, li ) => {
    const $li = $( li );
    const author = text( $li.find( ".name" ).text() );
    const date = text( $li.find( ".time" ).text() );
    const body = text( $li.find( ".comment" ).text() );
    const ratingAttr = $li.find( ".rate span[review-star]" ).attr( "review-star" );
    const rating = ratingAttr ? Number( ratingAttr ) : undefined;
    reviews.push( { author, date, body, rating } );
  } );

  // soldCount 猜测：查找包含 sold/sales/已售 的块
  let soldCount: number | undefined;
  const soldText =
    text( $( "#Product_cover .info .sold" ).text() ) ||
    text( $( "*:contains('sold')" ).first().text() ) ||
    text( $( "*:contains('已售')" ).first().text() ) ||
    "";
  const soldNum = soldText.replace( /[^\d]/g, "" );
  if ( soldNum ) soldCount = Number( soldNum );

  // 是否有即时发货
  const hasInstant = /instant\s*delivery/i.test( pageText ) || /จัดส่งทันที|ส่งทันที/.test( pageText );

  const product = {
    url,
    slug: url ? new URL( url ).pathname.replace( /^\/+|\/+$/g, "" ) : undefined,
    name,
    sku,
    brand,
    mpn,
    region,
    currency,
    images,
    ogImage,
    descriptionHtml,
    guideHtml,
    offers,
    aggregateRating,
    reviews,
    related,
    supportedGames,
    hreflangs,
    canonical,
    platform: platformGuess,
    soldCount,
    hasInstant,
  };

  return ParsedSchema.parse( product );
}

/** ===== 映射到你需要的 Product 输出结构 ===== */
export function toProductOut( parsed: z.infer<typeof ParsedSchema> ): z.infer<typeof ProductOutSchema> {
  const nowIso = new Date().toISOString();

  // slug & id
  const slugFromUrl = parsed.slug?.split( "/" ).filter( Boolean ).pop();
  const slug = slugFromUrl || slugify( parsed.name );
  const id =
    ( parsed.sku && slugify( parsed.sku ) ) ||
    ( slug ? slug : slugify( parsed.name ) );

  // 图片（去重）
  const images = Array.from( new Set( parsed.images ) );

  // 价格：面额里取最小值为 basePrice；salePrice 若检测不到“原价”则等同 basePrice
  const denomValues = parsed.offers
    .map( o => ( o?.price == null ? null : Number( o.price ) ) )
    .filter( ( n ): n is number => typeof n === "number" && !isNaN( n ) );

  const basePrice = denomValues.length ? Math.min( ...denomValues ) : null;
  const salePrice = basePrice; // 没有解析“旧价”的来源，缺省同 basePrice（可按需扩展）

  // metadata.denominations
  const denominations = parsed.offers
    .map( o => ( o?.price == null ? null : { value: Number( o.price ), currency: parsed.currency } ) )
    .filter( Boolean ) as { value: number; currency?: string }[];

  // 描述 & 简介
  const descText = htmlToText( parsed.descriptionHtml );
  const guideText = htmlToText( parsed.guideHtml );
  const shortDescription =
    descText.split( "\n" ).find( Boolean )?.slice( 0, 160 ) ||
    `Instant digital delivery${ parsed.region ? ` • ${ parsed.region }` : "" }`;

  // howToRedeem – 尝试从 guideText 拆分，否则给默认模板
  let howToRedeem = guideText
    ? guideText
      .split( /\n+/ )
      .map( s => text( s ) )
      .filter( Boolean )
    : [
      "Go to the relevant store",
      "Select \"Redeem Code\"",
      "Enter your code",
      "Confirm to add funds or unlock content",
    ];

  // terms – 页面无明确 Terms 时提供通用条款
  const termsDefaults = [
    "Digital code is non-refundable once revealed",
    "One-time use only",
    "Cannot be exchanged for cash",
  ];
  const terms = termsDefaults;

  // 推断 productType
  const nameLower = parsed.name.toLowerCase();
  const productType =
    nameLower.includes( "card" ) || nameLower.includes( "gift" ) ? "GIFT_CARD"
      : nameLower.includes( "code" ) ? "DIGITAL_CODE"
        : "GAME_CARD";

  // autoDelivery
  const autoDelivery = parsed.hasInstant ?? true;

  // tags
  const tags = Array.from(
    new Set(
      [
        parsed.platform?.toLowerCase(),
        parsed.region?.toLowerCase(),
        productType === "GIFT_CARD" ? "gift-card" : undefined,
        "digital",
      ].filter( Boolean ) as string[]
    )
  );

  const out = {
    id,
    name: parsed.name,
    slug,
    description: descText || parsed.name, // 若无描述，用名称占位
    shortDescription,
    productType,
    status: "ACTIVE",
    images,
    sku: parsed.sku,
    region: parsed.region,
    platform: parsed.platform,
    basePrice,
    salePrice,
    currency: parsed.currency || "MYR",
    stock: 100,
    unlimited: false,
    lowStockAlert: 10,
    autoDelivery,
    deliveryTemplate: "Instant digital delivery",
    metadata: {
      denominations,
      howToRedeem,
      terms,
    },
    tags,
    sortOrder: 1,
    createdAt: nowIso,
    updatedAt: nowIso,
    categoryId: "gift-cards",
    rating: parsed.aggregateRating?.ratingValue ?? null,
    reviewCount: parsed.aggregateRating?.ratingCount ?? ( parsed.reviews?.length || 0 ),
    soldCount: parsed.soldCount ?? 0,
  };

  return ProductOutSchema.parse( out );
}

/** ===== 统一入口：从 HTML -> 你的 Product 结构 ===== */
export function parseSeagmProduct( html: string, url = "" ) {
  const parsed = parseSeagmProductRaw( html, url );
  return toProductOut( parsed );
}

/** ===== CLI：读取本地 HTML 文件并输出 JSON（你的 Product 结构） ===== */
if ( import.meta.url === `file://${ process.argv[ 1 ] }` ) {
  const file = process.argv[ 2 ];
  if ( !file ) {
    console.error( "Usage: node parse-seagm.js <file.html> [<url>]" );
    process.exit( 1 );
  }
  const html = fs.readFileSync( path.resolve( file ), "utf8" );
  const url = process.argv[ 3 ] || "https://www.seagm.com/razer-gold-malaysia";
  const data = parseSeagmProduct( html, url );
  console.log( JSON.stringify( data, null, 2 ) );
}
