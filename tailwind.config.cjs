/** 仅用于把工作台 Tailwind 类编成本地 CSS，页面不再依赖外网 JIT。 */
module.exports = {
    content: ['./workshop.html'],
    theme: {
        extend: {
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei UI', 'Microsoft YaHei', 'sans-serif']
            },
            colors: {
                canvas: { DEFAULT: '#f4f1ea', subtle: '#f7f5f0' },
                ink: { DEFAULT: '#161513', secondary: '#4f4b45', tertiary: '#6e695f' },
                accent: { DEFAULT: '#3d534b', hover: '#2d3f39', muted: 'rgba(61,83,75,0.10)' },
                line: 'rgba(22,21,19,0.12)'
            },
            boxShadow: {
                card: '0 1px 3px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)',
                nav: '0 1px 2px rgba(0,0,0,0.04)'
            }
        }
    }
};
