const fs = require('fs');
let data = fs.readFileSync('D:/marriage/src/lib/data-store.ts', 'utf8');
data = data.replace(/verificationBadge: 'VERIFIED'/g, "verificationBadge: 'APPROVED'");
fs.writeFileSync('D:/marriage/src/lib/data-store.ts', data);
console.log('done');
