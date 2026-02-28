const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

let lastResponse = null;
let lastResponseJson = null;

Given('the API base URL is {string}', function (url) {
  this.baseUrl = url;
});

Given('the API base URL is from environment', function () {
  this.baseUrl = process.env.BASE_URL || 'http://localhost:3000';
});

When('I GET {string}', async function (path) {
  const url = (this.baseUrl || BASE_URL) + path;
  lastResponse = await fetch(url, { method: 'GET' });
  try {
    lastResponseJson = await lastResponse.json();
  } catch {
    lastResponseJson = null;
  }
});

When('I POST {string} with body:', async function (path, body) {
  const url = (this.baseUrl || BASE_URL) + path;
  lastResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body.trim()
  });
  try {
    lastResponseJson = await lastResponse.json();
  } catch {
    lastResponseJson = null;
  }
});

Then('the response status should be {int}', function (expected) {
  assert.strictEqual(lastResponse.status, expected, `Expected status ${expected}, got ${lastResponse.status}`);
});

Then('the response status should be {int} or {int}', function (a, b) {
  const status = lastResponse.status;
  assert.ok(status === a || status === b, `Expected status ${a} or ${b}, got ${status}`);
});

Then('the response JSON {string} should be true', function (key) {
  const value = getNested(lastResponseJson, key);
  assert.strictEqual(value, true, `Expected "${key}" to be true, got ${JSON.stringify(value)}`);
});

Then('the response JSON {string} should be an array', function (key) {
  const value = getNested(lastResponseJson, key);
  assert.ok(Array.isArray(value), `Expected "${key}" to be an array, got ${typeof value}`);
});

Then('the response JSON {string} should be present', function (key) {
  const value = getNested(lastResponseJson, key);
  assert.notStrictEqual(value, undefined, `Expected "${key}" to be present`);
});

Then('each item in {string} has keys {string}', function (arrayKey, keysStr) {
  const arr = getNested(lastResponseJson, arrayKey);
  assert.ok(Array.isArray(arr), `Expected "${arrayKey}" to be an array`);
  const keys = keysStr.split(',').map(k => k.trim().replace(/^"|"$/g, ''));
  for (const item of arr) {
    for (const k of keys) {
      assert.ok(Object.prototype.hasOwnProperty.call(item, k), `Expected item to have "${k}"`);
    }
  }
});

Then('each {string} in {string} is one of {string}', function (field, arrayKey, allowedStr) {
  const arr = getNested(lastResponseJson, arrayKey);
  const allowed = allowedStr.split(',').map(s => s.trim().replace(/^"|"$/g, ''));
  assert.ok(Array.isArray(arr), `Expected "${arrayKey}" to be an array`);
  for (const item of arr) {
    const val = item[field];
    assert.ok(allowed.includes(val), `Expected "${field}" to be one of ${allowed.join(', ')}, got ${val}`);
  }
});

function getNested(obj, path) {
  const keys = path.split('.');
  let cur = obj;
  for (const k of keys) {
    if (cur == null) return undefined;
    cur = cur[k];
  }
  return cur;
}
