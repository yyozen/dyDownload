import { get } from '../client/http.js'
import { APINotFoundError, APIResponseError } from '../errors/index.js'
import { extractValidUrls } from './common.js'

const DOUYIN_USER_PATTERN = /user\/([^/?]*)/
const REDIRECT_SEC_UID_PATTERN = /sec_uid=([^&]*)/
const DOUYIN_VIDEO_PATTERN = /video\/([^/?]*)/
const DOUYIN_NOTE_PATTERN = /note\/([^/?]*)/
const DOUYIN_MIX_PATTERN = /collection\/([^/?]*)/
const DOUYIN_LIVE_PATTERN = /live\/([^/?]*)/
const DOUYIN_LIVE_PATTERN2 = /https?:\/\/live\.douyin\.com\/(\d+)/
const DOUYIN_ROOM_PATTERN = /reflow\/([^/?]*)/

export async function getSecUserId(url: string): Promise<string> {
  if (typeof url !== 'string') {
    throw new TypeError('参数必须是字符串类型')
  }

  const validUrl = extractValidUrls(url)
  if (!validUrl) {
    throw new APINotFoundError('输入的URL不合法')
  }

  const parsedUrl = new URL(validUrl)
  const host = parsedUrl.hostname

  const pattern =
    host === 'v.douyin.com' || host.endsWith('.v.douyin.com')
      ? REDIRECT_SEC_UID_PATTERN
      : DOUYIN_USER_PATTERN

  const response = await get<string>(validUrl, { followRedirects: true })

  if (response.status === 200 || response.status === 444) {
    const match = pattern.exec(response.url)
    if (match) {
      return match[1]
    }
    throw new APIResponseError('未在响应的地址中找到sec_user_id，检查链接是否为用户主页')
  }

  throw new APIResponseError(`状态码错误: ${response.status}`)
}

export async function getAllSecUserId(urls: string[]): Promise<string[]> {
  if (!Array.isArray(urls)) {
    throw new TypeError('参数必须是数组类型')
  }

  const validUrls = extractValidUrls(urls)
  if (validUrls.length === 0) {
    throw new APINotFoundError('输入的URL列表不合法')
  }

  return Promise.all(validUrls.map(url => getSecUserId(url)))
}

export async function getAwemeId(url: string): Promise<string> {
  if (typeof url !== 'string') {
    throw new TypeError('参数必须是字符串类型')
  }

  const validUrl = extractValidUrls(url)
  if (!validUrl) {
    throw new APINotFoundError('输入的URL不合法')
  }

  const response = await get<string>(validUrl, { followRedirects: true })

  let match = DOUYIN_VIDEO_PATTERN.exec(response.url)
  if (match) {
    return match[1]
  }

  match = DOUYIN_NOTE_PATTERN.exec(response.url)
  if (match) {
    return match[1]
  }

  throw new APIResponseError('未在响应的地址中找到aweme_id，当前链接暂时不支持')
}

export async function getAllAwemeId(urls: string[]): Promise<string[]> {
  if (!Array.isArray(urls)) {
    throw new TypeError('参数必须是数组类型')
  }

  const validUrls = extractValidUrls(urls)
  if (validUrls.length === 0) {
    throw new APINotFoundError('输入的URL列表不合法')
  }

  return Promise.all(validUrls.map(url => getAwemeId(url)))
}

export async function getMixId(url: string): Promise<string> {
  if (typeof url !== 'string') {
    throw new TypeError('参数必须是字符串类型')
  }

  const validUrl = extractValidUrls(url)
  if (!validUrl) {
    throw new APINotFoundError('输入的URL不合法')
  }

  const response = await get<string>(validUrl, { followRedirects: true })

  const match = DOUYIN_MIX_PATTERN.exec(response.url)
  if (match) {
    return match[1]
  }

  throw new APIResponseError('未在响应的地址中找到mix_id，检查链接是否为合集页')
}

export async function getAllMixId(urls: string[]): Promise<string[]> {
  if (!Array.isArray(urls)) {
    throw new TypeError('参数必须是数组类型')
  }

  const validUrls = extractValidUrls(urls)
  if (validUrls.length === 0) {
    throw new APINotFoundError('输入的URL列表不合法')
  }

  return Promise.all(validUrls.map(url => getMixId(url)))
}

export async function getWebcastId(url: string): Promise<string> {
  if (typeof url !== 'string') {
    throw new TypeError('参数必须是字符串类型')
  }

  const validUrl = extractValidUrls(url)
  if (!validUrl) {
    throw new APINotFoundError('输入的URL不合法')
  }

  const response = await get<string>(validUrl, { followRedirects: true })
  const finalUrl = response.url

  let match = DOUYIN_LIVE_PATTERN.exec(finalUrl)
  if (match) {
    return match[1]
  }

  match = DOUYIN_LIVE_PATTERN2.exec(finalUrl)
  if (match) {
    return match[1]
  }

  match = DOUYIN_ROOM_PATTERN.exec(finalUrl)
  if (match) {
    console.warn('该链接返回的是room_id，请使用getRoomId方法处理APP端分享链接')
    return match[1]
  }

  throw new APIResponseError('未在响应的地址中找到webcast_id，检查链接是否为直播页')
}

export async function getAllWebcastId(urls: string[]): Promise<string[]> {
  if (!Array.isArray(urls)) {
    throw new TypeError('参数必须是数组类型')
  }

  const validUrls = extractValidUrls(urls)
  if (validUrls.length === 0) {
    throw new APINotFoundError('输入的URL列表不合法')
  }

  return Promise.all(validUrls.map(url => getWebcastId(url)))
}

export async function getRoomId(url: string): Promise<string> {
  if (typeof url !== 'string') {
    throw new TypeError('参数必须是字符串类型')
  }

  const validUrl = extractValidUrls(url)
  if (!validUrl) {
    throw new APINotFoundError('输入的URL不合法')
  }

  const response = await get<string>(validUrl, { followRedirects: true })

  const match = DOUYIN_ROOM_PATTERN.exec(response.url)
  if (match) {
    return match[1]
  }

  throw new APIResponseError('未在响应的地址中找到room_id，检查链接是否为直播页')
}

export async function getAllRoomId(urls: string[]): Promise<string[]> {
  if (!Array.isArray(urls)) {
    throw new TypeError('参数必须是数组类型')
  }

  const validUrls = extractValidUrls(urls)
  if (validUrls.length === 0) {
    throw new APINotFoundError('输入的URL列表不合法')
  }

  return Promise.all(validUrls.map(url => getRoomId(url)))
}
