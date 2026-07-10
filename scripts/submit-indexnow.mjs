const host = 'exactbusinessdays.com';
const key = 'daa1802b4b278b1fd537f267359114dd';
const keyLocation = `https://${host}/${key}.txt`;
const sitemapUrl = `https://${host}/sitemap.xml`;

const sitemapResponse = await fetch(sitemapUrl, { headers: { 'user-agent': 'ExactBusinessDays-IndexNow/1.0' } });
if (!sitemapResponse.ok) throw new Error(`Could not fetch sitemap: ${sitemapResponse.status}`);

const sitemap = await sitemapResponse.text();
const urlList = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1]);
if (!urlList.length) throw new Error('No URLs found in the live sitemap.');

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host, key, keyLocation, urlList })
});

if (!response.ok) throw new Error(`IndexNow submission failed: ${response.status} ${await response.text()}`);
console.log(`Submitted ${urlList.length} live sitemap URLs to IndexNow (${response.status}).`);
