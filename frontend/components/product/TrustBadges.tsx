'use client';

export function TrustBadges() {
  const badges = [
    {
      icon: '🚚',
      title: '免费配送',
      description: '全球免费配送'
    },
    {
      icon: '🛡️',
      title: '安全支付',
      description: 'SSL加密保护'
    },
    {
      icon: '↩️',
      title: '30天退货',
      description: '无忧退货政策'
    },
    {
      icon: '⭐',
      title: '正品保证',
      description: '100%正品认证'
    },
    {
      icon: '⚡',
      title: '快速发货',
      description: '24小时内发货'
    },
    {
      icon: '💬',
      title: '客服支持',
      description: '7×24小时在线'
    }
  ];

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
        为什么选择我们
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="text-center p-4 rounded-xl bg-white hover:shadow-md transition-shadow"
          >
            <div className="text-2xl mb-2">{badge.icon}</div>
            <div className="font-semibold text-gray-900 text-sm mb-1">
              {badge.title}
            </div>
            <div className="text-xs text-gray-600">
              {badge.description}
            </div>
          </div>
        ))}
      </div>
      
      {/* 额外信任指标 */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>10,000+ 满意客户</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>4.9/5 评分</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>99% 发货率</span>
          </div>
        </div>
      </div>
    </div>
  );
}
