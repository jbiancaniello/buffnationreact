const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const fetch = require("node-fetch");
require("dotenv").config();

const apiKey = process.env.REACT_APP_API_KEY; // Replace this with your API key if needed
const storySpreadsheetId = "1c0ZiOjzHAkhaEgucExY0logR9P7S6cRbaxtVz4MC2jY";

const fetchGoogleSheetsData = async (sheetName) => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${storySpreadsheetId}/values/${sheetName}?key=${apiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!data.values) return [];
    const headers = data.values[0];
    const rows = data.values.slice(1);

    return rows.map((row) => {
      const story = Object.fromEntries(
        headers.map((key, i) => [key, row[i]])
      );
      return story;
    });
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    return [];
  }
};

const generateSlug = (headline) => {
  return headline
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

const generateSitemap = async () => {
  const baseUrl = "https://buffnation.info"; // Replace with your website's base URL
  const stories = await fetchGoogleSheetsData("NewsStory");

  const sitemap = new SitemapStream({ hostname: baseUrl });

  // Add static routes
  sitemap.write({ url: "/", changefreq: "daily", priority: 1.0 });
  sitemap.write({ url: "/all-stories", changefreq: "daily", priority: 0.9 });

  // Add dynamic story routes
  stories.forEach((story) => {
    sitemap.write({
      url: `/story/${generateSlug(story.Headline)}`,
      lastmod: new Date(story.Date).toISOString(),
      changefreq: "weekly",
      priority: 0.8,
    });
  });

  sitemap.end();

  // Save sitemap to public directory
  const sitemapData = await streamToPromise(sitemap);
  fs.writeFileSync("./public/sitemap.xml", sitemapData.toString());
  console.log("Sitemap generated successfully at ./public/sitemap.xml");
};

generateSitemap();
