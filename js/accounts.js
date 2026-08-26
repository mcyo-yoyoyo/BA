/**
 * 发布用账号表（只存哈希，不存密码）。
 * 本机若有 accounts.local.js，会覆盖这里。
 * hash = SHA-256 hex of youwei.v1:{user}:{password}
 */
window.YOUWEI_LOCAL_ACCOUNTS = {
    mcyo: {
        hash: '3d72c60e1ccba842d393dbc5ea55ceef337aef7c7ae363217fd311c5acafe6b5',
        role: 'admin'
    },
    demo: {
        hash: '54fe1ed3ddc71f4c09d4f5f17ab8c8045d94ff47acbe675b2e25e6d9d894cbd4',
        role: 'client'
    },
    user: {
        hash: 'a300ca59290046474d9e449bd642532a548231e652e391238e2622097f1682d0',
        role: 'client'
    },
    admin: {
        hash: '373704ab28f992b5607f6ccd7a3fac7bac20658fd818bd71f2d6b27cc1923b95',
        role: 'admin'
    }
};
