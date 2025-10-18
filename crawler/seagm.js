#!/usr/bin/env node
// seagm-scrape.js
import fs from "fs-extra";
import path from "path";
import { load as loadHTML } from "cheerio";
import { z } from "zod";

/* ---------- helpers ---------- */
const text = ( s ) => ( s || "" ).replace( /\s+/g, " " ).trim();
const moneyToNumber = ( s ) => {
  if ( !s ) return null;
  const num = s.replace( /[^\d.]/g, "" );
  return num ? Number( num ) : null;
};
const sleep = ( ms ) => new Promise( r => setTimeout( r, ms ) );
const safeSlug = ( url ) => {
  try {
    const u = new URL( url );
    const parts = u.pathname.split( "/" ).filter( Boolean );
    const last = ( parts[ parts.length - 1 ] || "" ).toLowerCase();
    return last.replace( /[^a-z0-9-_]/g, "-" ).replace( /-+/g, "-" );
  } catch {
    return "product";
  }
};
const extFromUrl = ( u ) => {
  try {
    const p = new URL( u ).pathname;
    const base = p.split( "/" ).pop() || "";
    const ext = base.includes( "." ) ? base.split( "." ).pop() : "jpg";
    return ext.toLowerCase().split( "?" )[ 0 ].replace( /[^a-z0-9]/g, "" ) || "jpg";
  } catch {
    return "jpg";
  }
};

/* ---------- schema ---------- */
const ProductSchema = z.object( {
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
    id: z.string(),
    name: z.string(),
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
  canonical: z.string().optional()
} );

/* ---------- 解析 ---------- */
function parseSeagmProduct( html, url = "" ) {
  const $ = loadHTML( html );

  const name = text( $( "#Product_cover .info .name h1" ).first().text() ) ||
    text( $( "meta[property='og:title']" ).attr( "content" ) ) ||
    text( $( "title" ).text() );

  const region = text( $( "#Product_cover .feature li .C b" ).first().text() );

  const cardImg = $( "#Product_cover .CardPic" ).attr( "src" );
  const ogImage = $( "meta[property='og:image']" ).attr( "content" );
  const moreIconImgs = [];
  $( "#SKU_list .SKU_type .img img, #related_items .img img, #supported_game .img img" ).each( ( _, el ) => {
    const src = el.attribs[ "data-src" ] || el.attribs[ "src" ];
    if ( src ) moreIconImgs.push( src );
  } );
  const images = Array.from( new Set( [ cardImg, ...moreIconImgs ].filter( Boolean ) ) );

  const hreflangs = [];
  $( "link[rel='alternate'][hreflang]" ).each( ( _, el ) => {
    hreflangs.push( { lang: el.attribs.hreflang, href: el.attribs.href } );
  } );
  const canonical = $( "link[rel='canonical']" ).attr( "href" );

  let brand, sku, mpn, aggregateRating;
  $( "script[type='application/ld+json']" ).each( ( _, el ) => {
    try {
      const data = JSON.parse( $( el ).contents().text() );
      const arr = Array.isArray( data ) ? data : [ data ];
      for ( const node of arr ) {
        if ( node[ "@type" ] === "Product" ) {
          brand = node?.brand?.name || brand;
          sku = node?.sku?.toString() || sku;
          mpn = node?.mpn || mpn;
          if ( node.aggregateRating ) {
            aggregateRating = {
              ratingValue: Number( node.aggregateRating.ratingValue ),
              ratingCount: Number( node.aggregateRating.ratingCount ),
            };
          }
        }
      }
    } catch { }
  } );

  const currencyGuess = /RM/.test( $.root().text() ) ? "MYR" : undefined;

  const offers = [];
  $( "#cardType li" ).each( ( _, li ) => {
    const $li = $( li );
    const id = $li.find( "input[type=radio]" ).attr( "value" );
    const oname = text( $li.find( ".SKU_type .T .sku" ).text() );
    const priceText = text( $li.find( ".SKU_type .C .price b" ).text() );
    offers.push( { id, name: oname, price: moneyToNumber( priceText ) } );
  } );

  const descriptionHtml = $( "#item_description article.docs" ).html()?.trim();
  const guideHtml = $( "#item_instruction article.docs" ).html()?.trim();

  const related = [];
  $( "#related_items .ItemList li a" ).each( ( _, a ) => {
    related.push( {
      title: text( $( a ).find( ".T .name" ).text() ),
      href: $( a ).attr( "href" )
    } );
  } );

  const supportedGames = [];
  $( "#supported_game .ItemList li a" ).each( ( _, a ) => {
    supportedGames.push( {
      title: text( $( a ).find( ".T .name" ).text() ),
      href: $( a ).attr( "href" )
    } );
  } );

  const reviews = [];
  $( "#item_reviews .review_list > li" ).each( ( _, li ) => {
    const $li = $( li );
    const author = text( $li.find( ".name" ).text() );
    const date = text( $li.find( ".time" ).text() );
    const body = text( $li.find( ".comment" ).text() );
    const ratingAttr = $li.find( ".rate span[review-star]" ).attr( "review-star" );
    const rating = ratingAttr ? Number( ratingAttr ) : undefined;
    reviews.push( { author, date, body, rating } );
  } );

  const product = {
    url,
    slug: safeSlug( url ),
    name,
    sku,
    brand,
    mpn,
    region,
    currency: currencyGuess,
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
    canonical
  };

  return ProductSchema.parse( product );
}

/* ---------- polite fetch ---------- */
async function fetchHtml( url, { retries = 3 } = {} ) {
  const ua = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";
  let lastErr;
  for ( let i = 0; i < retries; i++ ) {
    try {
      const res = await fetch( url, {
        headers: {
          "user-agent": ua,
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "accept-language": "en-US,en;q=0.9",
        }
      } );
      if ( !res.ok ) throw new Error( `HTTP ${ res.status }` );
      return await res.text();
    } catch ( e ) {
      lastErr = e;
      await sleep( 500 * ( i + 1 ) );
    }
  }
  throw lastErr;
}

/* ---------- image downloader (按 slug 目录存放) ---------- */
async function downloadImages( urls, slugDir, slug ) {
  const imagesDir = path.join( slugDir, "images" );
  await fs.ensureDir( imagesDir );
  const saved = [];
  let i = 1;
  for ( const u of urls ) {
    try {
      const res = await fetch( u );
      if ( !res.ok ) throw new Error( `HTTP ${ res.status }` );
      const ext = extFromUrl( u );
      const fname = `${ slug }-${ i }.${ ext }`;
      const fpath = path.join( imagesDir, fname );
      const buf = Buffer.from( await res.arrayBuffer() );
      await fs.writeFile( fpath, buf );
      saved.push( { url: u, file: fpath } );
      i++;
      await sleep( 80 );
    } catch {
      // 跳过失败的图片
    }
  }
  return saved;
}

/* ---------- CLI ---------- */
( async () => {
  const url = process.argv[ 2 ] || "https://www.seagm.com/razer-gold-malaysia";
  const downloadFlag = process.argv.includes( "--download-images" );

  // ⚠️ 抓取前请确认 robots.txt 与站点 TOS
  const html = await fetchHtml( url );
  const data = parseSeagmProduct( html, url );
  const slug = data.slug || safeSlug( url );

  // 以 slug 创建专属目录
  const slugDir = path.join( process.cwd(), slug );
  await fs.ensureDir( slugDir );

  // 下载图片到 ./<slug>/images/
  if ( downloadFlag && data.images?.length ) {
    const files = await downloadImages( data.images, slugDir, slug );
    data.localImages = files; // [{url, file}]
  }

  // 保存 JSON 到 ./<slug>/<slug>.json
  const jsonPath = path.join( slugDir, `${ slug }.json` );
  await fs.writeJson( jsonPath, data, { spaces: 2 } );

  console.log( `Saved JSON -> ${ jsonPath }` );
  if ( downloadFlag ) console.log( `Saved images -> ${ path.join( slugDir, "images" ) }/` );
} )().catch( ( e ) => {
  console.error( "Failed:", e?.message || e );
  process.exit( 1 );
} );

