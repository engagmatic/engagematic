#!/usr/bin/env node

// Blog Import Script for LinkedInPulse
// This script imports all prepared blogs into the blog management system

const fs = require('fs');
const path = require('path');

// Read the prepared blogs
const blogs = JSON.parse(fs.readFileSync('published-blogs.json', 'utf8'));

console.log('🚀 LinkedInPulse Blog Publishing System');
console.log('=====================================\n');

console.log('📝 Publishing Blogs:');
console.log('===================');

blogs.forEach((blog, index) => {
  console.log(`${index + 1}. ${blog.title}`);
  console.log(`   Category: ${blog.category}`);
  console.log(`   Tags: ${blog.tags.join(', ')}`);
  console.log(`   Status: ${blog.status}`);
  console.log(`   Featured: ${blog.isFeatured ? 'Yes' : 'No'}`);
  console.log(`   Read Time: ${blog.readTime} minutes`);
  console.log(`   Slug: ${blog.slug}`);
  console.log('');
});

console.log('📊 Publishing Summary:');
console.log('=====================');
console.log(`Total Blogs: ${blogs.length}`);
console.log(`Comparison Blogs: ${blogs.filter(b => b.title.includes('vs')).length}`);
console.log(`Use Case Blogs: ${blogs.filter(b => !b.title.includes('vs')).length}`);
console.log(`Featured Blogs: ${blogs.filter(b => b.isFeatured).length}`);
console.log(`Published Status: ${blogs.filter(b => b.status === 'published').length}`);

console.log('\n🎯 Blog Categories:');
const categories = [...new Set(blogs.map(b => b.category))];
categories.forEach(category => {
  const count = blogs.filter(b => b.category === category).length;
  console.log(`- ${category}: ${count} blogs`);
});

console.log('\n🏷️ Popular Tags:');
const allTags = blogs.flatMap(b => b.tags);
const tagCounts = {};
allTags.forEach(tag => {
  tagCounts[tag] = (tagCounts[tag] || 0) + 1;
});
const sortedTags = Object.entries(tagCounts)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10);

sortedTags.forEach(([tag, count]) => {
  console.log(`- ${tag}: ${count} blogs`);
});

console.log('\n✅ All blogs are ready for publication!');
console.log('\n📋 Next Steps:');
console.log('1. Access your admin panel at /admin/blogs');
console.log('2. Use the "Add Blog" feature to import each blog');
console.log('3. Or use the bulk import feature if available');
console.log('4. Verify all blogs are published correctly');
console.log('5. Check SEO settings and featured status');

console.log('\n🔗 Blog URLs (after publishing):');
blogs.forEach(blog => {
  console.log(`- /blogs/${blog.slug}`);
});

console.log('\n🎉 Blog publishing preparation complete!');
