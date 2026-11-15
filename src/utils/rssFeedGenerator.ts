/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Licensed to Richard Alan Witt (www.wittlawfirm.com / www.owenscompany.com)
 * DrFun1 Media Inc. & DrFun1 ECOM Inc.
 *
 * Standards-compliant RSS 2.0 XML & OPML 2.0 Bundle Generator for SATCOM News Feeds.
 */

import { RssArticleItem, RssFeedSource } from '../types/rssNews';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface RssChannelMetadata {
  title?: string;
  link?: string;
  description?: string;
  language?: string;
  managingEditor?: string;
}

export function generateRss20Xml(
  articles: RssArticleItem[],
  metadata: RssChannelMetadata = {}
): string {
  const title = metadata.title || 'DrFun1 SATCOM & Space Telecommunications RSS Wire';
  const link = metadata.link || 'https://drfun1.com/satcom-rss';
  const description =
    metadata.description ||
    'Real-time SATCOM, LEO/MEO/GEO constellations, FCC Space Bureau Part 25 dockets, ITU BR, NASA SCaN, and optical fiber teleport newsroom feed.';
  const language = metadata.language || 'en-us';
  const managingEditor =
    metadata.managingEditor || 'regulatory@wittlawfirm.com (Richard Alan Witt, Esq. - FRN 0034981290)';
  const buildDate = new Date().toUTCString();

  const itemsXml = articles
    .map((item) => {
      const itemPubDate = new Date(item.timestamp || Date.now()).toUTCString();
      const categoriesXml = [item.category, ...item.tags.slice(0, 4)]
        .filter(Boolean)
        .map((cat) => `      <category>${escapeXml(cat)}</category>`)
        .join('\n');

      const docketNote =
        item.fccDocketNumber || item.regulatoryPart
          ? ` [${[item.fccDocketNumber, item.regulatoryPart].filter(Boolean).join(' · ')}]`
          : '';

      return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <guid isPermaLink="false">${escapeXml(item.id)}</guid>
      <pubDate>${escapeXml(itemPubDate)}</pubDate>
      <source url="${escapeXml(item.link)}">${escapeXml(item.sourceName)}</source>
      <author>${escapeXml(item.author || item.sourceName)}</author>
${categoriesXml}
      <description>${escapeXml(`${item.description}${docketNote}`)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(link)}</link>
    <description>${escapeXml(description)}</description>
    <language>${escapeXml(language)}</language>
    <lastBuildDate>${escapeXml(buildDate)}</lastBuildDate>
    <managingEditor>${escapeXml(managingEditor)}</managingEditor>
    <generator>DrFun1 Media Ent SATCOM RSS 2.0 Aggregator</generator>
    <atom:link href="${escapeXml(link)}" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
}

export function generateOpmlXml(
  sources: RssFeedSource[],
  title = 'DrFun1 SATCOM & Space Telecom RSS Subscriptions'
): string {
  const dateCreated = new Date().toUTCString();
  const outlinesXml = sources
    .map(
      (src) =>
        `      <outline type="rss" text="${escapeXml(src.name)}" title="${escapeXml(
          `${src.name} (${src.organization})`
        )}" xmlUrl="${escapeXml(src.feedUrl)}" htmlUrl="${escapeXml(src.websiteUrl)}" category="${escapeXml(
          src.category
        )}" />`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<opml version="2.0">
  <head>
    <title>${escapeXml(title)}</title>
    <dateCreated>${escapeXml(dateCreated)}</dateCreated>
    <ownerName>DrFun1 Media Inc. (wittlawfirm.com · FRN 0034981290)</ownerName>
  </head>
  <body>
    <outline text="SATCOM &amp; Telecommunications RSS Feeds" title="SATCOM &amp; Telecommunications RSS Feeds">
${outlinesXml}
    </outline>
  </body>
</opml>`;
}
