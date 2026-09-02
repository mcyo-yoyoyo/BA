/**
 * 发布用账号表（只存哈希，不存密码）。
 * 本机 accounts.local.js 写入 YOUWEI_LOCAL_ACCOUNTS 后优先于本表。
 * 授权 bound 后，demo / user 不可登录（除非本机账号表覆盖）。
 * hash = SHA-256 hex of youwei.v1:{user}:{password}
 */
window.YOUWEI_ACCOUNTS = {
    mcyo: {
        hash: '3d72c60e1ccba842d393dbc5ea55ceef337aef7c7ae363217fd311c5acafe6b5',
        role: 'admin'
    },
    demo: {
        hash: '54fe1ed3ddc71f4c09d4f5f17ab8c8045d94ff47acbe675b2e25e6d9d894cbd4',
        role: 'client',
        demo: true
    },
    user: {
        hash: 'a300ca59290046474d9e449bd642532a548231e652e391238e2622097f1682d0',
        role: 'client',
        demo: true
    },
    admin: {
        hash: '373704ab28f992b5607f6ccd7a3fac7bac20658fd818bd71f2d6b27cc1923b95',
        role: 'admin'
    }
};
if (!window.YOUWEI_ACCOUNTS_SOURCE) window.YOUWEI_ACCOUNTS_SOURCE = 'published';
