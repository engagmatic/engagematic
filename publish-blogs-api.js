#!/usr/bin/env node

// Direct Blog Publishing API Script
// This script directly publishes blogs to the LinkedInPulse system via API

const fs = require('fs');
const https = require('https');
const http = require('http');

// Configuration
const API_BASE = process.env.API_URL || 'http://localhost:5000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'your-admin-token-here';

// Read prepared blogs
const blogs = JSON.parse(fs.readFileSync('published-blogs.json', 'utf8'));

console.log('🚀 LinkedInPulse Direct Blog Publishing');
console.log('=====================================\n');

// Function to make API request
function makeRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, API_BASE);
    const isHttps = url.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'User-Agent': 'LinkedInPulse-Blog-Publisher/1.0'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Function to publish a single blog
async function publishBlog(blog, index) {
  try {
    console.log(`📝 Publishing blog ${index + 1}/10: ${blog.title}`);
    
    const response = await makeRequest('/api/blog/admin/create', 'POST', blog);
    
    if (response.status === 201 || response.status === 200) {
      console.log(`✅ Successfully published: ${blog.title}`);
      console.log(`   URL: /blogs/${blog.slug}`);
      console.log(`   ID: ${response.data.data?._id || 'N/A'}`);
      return { success: true, blog: blog.title };
    } else {
      console.log(`❌ Failed to publish: ${blog.title}`);
      console.log(`   Status: ${response.status}`);
      console.log(`   Error: ${response.data.message || 'Unknown error'}`);
      return { success: false, blog: blog.title, error: response.data.message };
    }
  } catch (error) {
    console.log(`❌ Error publishing: ${blog.title}`);
    console.log(`   Error: ${error.message}`);
    return { success: false, blog: blog.title, error: error.message };
  }
}

// Function to publish all blogs
async function publishAllBlogs() {
  console.log('Starting blog publication process...\n');
  
  const results = [];
  
  for (let i = 0; i < blogs.length; i++) {
    const result = await publishBlog(blogs[i], i);
    results.push(result);
    
    // Add delay between requests to avoid overwhelming the server
    if (i < blogs.length - 1) {
      console.log('⏳ Waiting 2 seconds before next blog...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  return results;
}

// Function to display final results
function displayResults(results) {
  console.log('\n📊 Publishing Results:');
  console.log('======================');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Successfully published: ${successful.length}/${results.length}`);
  console.log(`❌ Failed to publish: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ Successfully Published Blogs:');
    successful.forEach((result, index) => {
      console.log(`${index + 1}. ${result.blog}`);
    });
  }
  
  if (failed.length > 0) {
    console.log('\n❌ Failed to Publish:');
    failed.forEach((result, index) => {
      console.log(`${index + 1}. ${result.blog}`);
      console.log(`   Error: ${result.error}`);
    });
  }
  
  console.log('\n🔗 Published Blog URLs:');
  successful.forEach((result, index) => {
    const blog = blogs.find(b => b.title === result.blog);
    if (blog) {
      console.log(`${index + 1}. ${API_BASE}/blogs/${blog.slug}`);
    }
  });
}

// Main execution
async function main() {
  try {
    console.log('🔧 Configuration:');
    console.log(`API Base URL: ${API_BASE}`);
    console.log(`Admin Token: ${ADMIN_TOKEN ? 'Set' : 'Not Set'}`);
    console.log(`Total Blogs: ${blogs.length}\n`);
    
    if (!ADMIN_TOKEN || ADMIN_TOKEN === 'your-admin-token-here') {
      console.log('⚠️  Warning: Admin token not set. Please set ADMIN_TOKEN environment variable.');
      console.log('   You can also edit this script and set the token directly.\n');
    }
    
    const results = await publishAllBlogs();
    displayResults(results);
    
    console.log('\n🎉 Blog publishing process completed!');
    
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the main function
if (require.main === module) {
  main();
}

module.exports = { publishAllBlogs, publishBlog };
