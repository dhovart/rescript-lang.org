// Generated by ReScript, PLEASE EDIT WITH CARE

import * as Fs from "fs";
import * as Path from "path";
import * as DateStr from "./DateStr.js";
import * as Js_dict from "bs-platform/lib/es6/js_dict.js";
import * as Process from "process";
import * as Belt_Array from "bs-platform/lib/es6/belt_Array.js";
import * as Belt_Option from "bs-platform/lib/es6/belt_Option.js";
import * as Caml_option from "bs-platform/lib/es6/caml_option.js";
import GrayMatter from "gray-matter";
import * as BlogFrontmatter from "./BlogFrontmatter.js";

var index = (require('../../index_data/blog_posts.json'));

var postsDirectory = Path.join(Process.cwd(), "./_blogposts");

function getFullSlug(slug) {
  return Belt_Option.map(Js_dict.get(index, slug), (function (relPath) {
                return relPath.replace(/\.mdx?/, "");
              }));
}

function getPostBySlug(slug) {
  var relPath = index[slug];
  var fullslug = relPath.replace(/\.mdx?/, "");
  var fullPath = Path.join(postsDirectory, fullslug + ".mdx");
  if (!Fs.existsSync(fullPath)) {
    return ;
  }
  var fileContents = Fs.readFileSync(fullPath, "utf8");
  var match = GrayMatter(fileContents);
  var archived = fullPath.includes("/archive/");
  return {
          slug: slug,
          content: match.content,
          fullslug: fullslug,
          archived: archived,
          frontmatter: match.data
        };
}

function getAllPosts(param) {
  return Belt_Array.reduce(Object.keys(index), [], (function (acc, slug) {
                var post = getPostBySlug(slug);
                if (post !== undefined) {
                  acc.push(post);
                }
                return acc;
              }));
}

function dateToUTCString(date) {
  date.setHours(15.0);
  return date.toUTCString();
}

function getLatest(maxOpt, baseUrlOpt, param) {
  var max = maxOpt !== undefined ? maxOpt : 10;
  var baseUrl = baseUrlOpt !== undefined ? baseUrlOpt : "https://rescript-lang.org";
  var authors = BlogFrontmatter.Author.getAllAuthors(undefined);
  return Belt_Array.reduce(getAllPosts(undefined), [], (function (acc, next) {
                    var fm = BlogFrontmatter.decode(authors, next.frontmatter);
                    if (fm.TAG !== /* Ok */0) {
                      return acc;
                    }
                    var fm$1 = fm._0;
                    var description = Belt_Option.getWithDefault(Caml_option.null_to_opt(fm$1.description), "");
                    var item_title = fm$1.title;
                    var item_href = baseUrl + ("/blog/" + next.slug);
                    var item_pubDate = DateStr.toDate(fm$1.date);
                    var item = {
                      title: item_title,
                      href: item_href,
                      description: description,
                      pubDate: item_pubDate
                    };
                    return Belt_Array.concat(acc, [item]);
                  })).sort(function (item1, item2) {
                var v1 = item1.pubDate.valueOf();
                var v2 = item2.pubDate.valueOf();
                if (v1 === v2) {
                  return 0;
                } else if (v1 > v2) {
                  return -1;
                } else {
                  return 1;
                }
              }).slice(0, max);
}

function toXmlString(siteTitleOpt, siteDescriptionOpt, items) {
  var siteTitle = siteTitleOpt !== undefined ? siteTitleOpt : "ReScript Blog";
  var siteDescription = siteDescriptionOpt !== undefined ? siteDescriptionOpt : "";
  var latestPubDateElement = Belt_Option.getWithDefault(Belt_Option.map(Belt_Array.get(items, 0), (function (item) {
              var latestPubDateStr = dateToUTCString(item.pubDate);
              return "<lastBuildDate>" + latestPubDateStr + "</lastBuildDate>";
            })), "");
  var itemsStr = Belt_Array.reduce(items, "", (function (acc, item) {
          var description = item.description;
          var href = item.href;
          var descriptionElement = description === "" ? "" : "<description>\n        <![CDATA[" + description + "]]>\n        </description>\n          ";
          var dateStr = dateToUTCString(item.pubDate);
          return acc + ("\n      <item>\n        <title> <![CDATA[" + item.title + "]]></title>\n        <link> " + href + " </link>\n        <guid> " + href + " </guid>\n        " + descriptionElement + "\n\n        <pubDate>" + dateStr + "</pubDate>\n\n    </item>");
        }));
  return "<?xml version=\"1.0\" encoding=\"utf-8\" ?>\n  <rss version=\"2.0\">\n    <channel>\n        <title>" + siteTitle + "</title>\n        <link>https://rescript-lang.org</link>\n        <description>" + siteDescription + "</description>\n        <language>en</language>\n        " + latestPubDateElement + "\n        " + itemsStr + "\n\n    </channel>\n  </rss>";
}

var RssFeed = {
  getLatest: getLatest,
  toXmlString: toXmlString
};

export {
  getAllPosts ,
  getFullSlug ,
  RssFeed ,
  
}
/* index Not a pure module */
