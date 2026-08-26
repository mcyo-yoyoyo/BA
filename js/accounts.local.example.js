/**
 * 复制为 accounts.local.js（该文件已 gitignore，不要提交）。
 * hash = SHA-256 hex of  youwei.v1:{user}:{password}
 *
 * 生成本机哈希（把 USER / PASS 换成实际值）：
 *   node -e "console.log(require('crypto').createHash('sha256').update('youwei.v1:'+process.env.USER+':'+process.env.PASS).digest('hex'))"
 *
 * 下面是占位，不能登录。换成你的账号哈希后再复制为 accounts.local.js。
 */
window.YOUWEI_LOCAL_ACCOUNTS = {
    demo: { hash: '0000000000000000000000000000000000000000000000000000000000000000', role: 'client' },
    admin: { hash: '1111111111111111111111111111111111111111111111111111111111111111', role: 'admin' }
};
