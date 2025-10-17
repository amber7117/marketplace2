import React, { useState } from 'react';
import Image from 'next/image';

// 示例数据，可后续替换为API数据
type Denomination = {
  id: number;
  label: string;
  uc: number;
  price: number;
  freeUC: number;
};

const denominations: Denomination[] = [
  { id: 1, label: 'PUBG M 60 UC Code', uc: 60, price: 3.82, freeUC: 25 },
  { id: 2, label: 'PUBG M 300+25 UC Code', uc: 325, price: 19.03, freeUC: 25 },
  { id: 3, label: 'PUBG M 600+60 UC Code', uc: 660, price: 38.17, freeUC: 60 },
  { id: 4, label: 'PUBG M 1500+300 UC Code', uc: 1800, price: 190.87, freeUC: 300 },
  { id: 5, label: 'PUBG M 3000+850 UC Code', uc: 3850, price: 371.76, freeUC: 850 },
  { id: 6, label: 'PUBG M 6000+2100 UC Code', uc: 8100, price: 753.41, freeUC: 2100 },
  { id: 7, label: 'PUBG M 12000+4200 UC Code', uc: 16200, price: 1453.21, freeUC: 4200 },
  { id: 8, label: 'PUBG M 24000+8400 UC Code', uc: 32400, price: 2906.58, freeUC: 8400 },
  { id: 9, label: 'PUBG M 30000+10500 UC Code', uc: 40500, price: 3638.96, freeUC: 10500 },
];

export default function ProductDetailPage() {
  const [selected, setSelected] = useState(denominations[0]);
  const [quantity, setQuantity] = useState(1);

  const total = (selected.price * quantity).toFixed(2);

  return (
    <div className="max-w-5xl mx-auto p-4">
      {/* 顶部产品信息 */}
      <div className="flex flex-col md:flex-row gap-6">
  <Image src="/pubg-uc.jpg" alt="PUBG UC" width={192} height={256} className="w-48 h-64 object-cover rounded shadow" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2">PUBG MOBILE UC REDEEM CODE (GLOBAL)</h1>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">Global</span>
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Instant Delivery</span>
          </div>
          <p className="text-gray-600 text-sm mb-4">PUBG Mobile UC Redeem Code (Global) 可用于全球大部分服务器，除中国、日本、韩国、台湾、越南外。</p>
          {/* 面额选择 */}
          <div className="mb-4">
            <div className="font-semibold mb-1">选择面额</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {denominations.map((d) => (
                <button
                  key={d.id}
                  className={`border rounded p-2 text-left hover:border-blue-500 ${selected.id === d.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                  onClick={() => setSelected(d)}
                >
                  <div className="font-medium">{d.label}</div>
                  <div className="text-xs text-gray-500">{d.uc} UC + {d.freeUC} Free UC</div>
                  <div className="text-red-500 font-bold mt-1">RM {d.price.toFixed(2)}</div>
                </button>
              ))}
            </div>
          </div>
          {/* 数量与总价 */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span>数量</span>
              <button className="px-2 border rounded" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
              <span className="w-8 text-center">{quantity}</span>
              <button className="px-2 border rounded" onClick={() => setQuantity(q => q + 1)}>+</button>
            </div>
            <div className="font-semibold">总价: <span className="text-red-500">RM {total}</span></div>
          </div>
          {/* 购买按钮区 */}
          <div className="flex gap-4 mb-2">
            <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-bold">立即购买</button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-bold">Buy with PayPal</button>
          </div>
          <div className="text-xs text-gray-400">支持未来购买</div>
        </div>
      </div>
      {/* 产品描述与兑换流程 */}
      <div className="mt-8 grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-bold mb-2">产品描述</h2>
          <p className="text-gray-700 text-sm mb-2">PUBG Mobile UC 兑换码是一组16位数字代码，可在PUBG Mobile游戏中兑换UC（Unknown Cash）。兑换后，UC会直接充值到您的游戏账号，可用于购买皮肤、道具等。</p>
          <ul className="list-disc pl-5 text-sm text-gray-700 mb-2">
            <li>最低价格，秒发货</li>
            <li>支持多种支付方式</li>
            <li>安全加密支付，信息安全</li>
            <li>24/7 客服支持</li>
            <li>全球通用（不支持中国、日本、韩国、台湾、越南）</li>
          </ul>
          <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">
            注意：本产品不适用于中国/日本/韩国/台湾/越南服务器。兑换码一经售出不退不换。
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold mb-2">如何兑换</h2>
          <ol className="list-decimal pl-5 text-sm text-gray-700 mb-2">
            <li>访问 <a href="https://www.midasbuy.com/midasbuy/my/redeem/pubgm" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">midasbuy.com</a> 并输入您的PUBG Mobile玩家ID</li>
            <li>输入兑换码并点击兑换</li>
            <li>UC将立即充值到您的PUBG Mobile账号</li>
          </ol>
          <div className="bg-gray-50 p-3 rounded text-xs text-gray-500">
            兑换码有效期见库存说明，售出后不退不换。
          </div>
        </div>
      </div>
      {/* 用户评论区（示例） */}
      <div className="mt-8">
        <h2 className="text-lg font-bold mb-2">用户评论</h2>
        <div className="space-y-2">
          <div className="border-b pb-2">
            <div className="font-semibold">Rareverse</div>
            <div className="text-yellow-500">★★★★★</div>
            <div className="text-xs text-gray-500">2023/09/08</div>
            <div className="text-sm">Nice n prompt uc,ure</div>
          </div>
          <div className="border-b pb-2">
            <div className="font-semibold">7Tu7A9H3D1Lle...</div>
            <div className="text-yellow-500">★★★★★</div>
            <div className="text-xs text-gray-500">2023/09/08</div>
            <div className="text-sm">I didn&apos;t receive the uc</div>
          </div>
        </div>
      </div>
      {/* 底部信息 */}
      <div className="mt-8 text-xs text-gray-400 text-center">
        © 2025 SEA Gamer Mall Sdn Bhd. All rights reserved.
      </div>
    </div>
);
}
