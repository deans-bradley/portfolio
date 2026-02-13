// utils/content-helper.js

import { $ } from './jquery-helper.js';

export function handleCopyRight() {
  const date = new Date();
  const year = date.getFullYear();
  $('#copy-right').html(`&copy; ${year} Bradley Deans. All rights reserved.`);
}