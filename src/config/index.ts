import { z } from 'zod'

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

export const ConfigSchema = z.object({
  cookie: z.string().default(''),
  userAgent: z.string().default(DEFAULT_USER_AGENT),
  referer: z.string().default('https://www.douyin.com/'),
  downloadPath: z.string().default('./downloads'),
  maxConcurrency: z.number().min(1).max(10).default(3),
  timeout: z.number().default(30000),
  retries: z.number().default(3),
  proxy: z.string().optional(),
  encryption: z.enum(['ab', 'xb']).default('xb'),
  msToken: z
    .object({
      url: z.string(),
      magic: z.number(),
      version: z.number(),
      dataType: z.number(),
      strData: z.string(),
      ulr: z.string(),
    })
    .default({
      url: 'https://mssdk.bytedance.com/web/common',
      magic: 538969122,
      version: 1,
      dataType: 8,
      strData: 'fWPWQg1dCuqIDf4raT8V',
      ulr: '',
    }),
  ttwid: z
    .object({
      url: z.string(),
      data: z.string(),
    })
    .default({
      url: 'https://ttwid.bytedance.com/ttwid/union/register/',
      data: JSON.stringify({
        region: 'cn',
        aid: 1768,
        needFid: false,
        service: 'www.ixigua.com',
        migrate_info: { ticket: '', source: 'node' },
        cbUrlProtocol: 'https',
        union: true,
      }),
    }),
  webid: z
    .object({
      url: z.string(),
      body: z.object({
        app_id: z.number(),
        referer: z.string(),
        url: z.string(),
        user_agent: z.string(),
      }),
    })
    .default({
      url: 'https://mcs.zijieapi.com/webid',
      body: {
        app_id: 6383,
        referer: 'https://www.douyin.com/',
        url: 'https://www.douyin.com/',
        user_agent: DEFAULT_USER_AGENT,
      },
    }),
})

export type Config = z.infer<typeof ConfigSchema>

let currentConfig: Config = ConfigSchema.parse({})

export function getConfig(): Config {
  return currentConfig
}

export function setConfig(config: Partial<Config>): Config {
  currentConfig = ConfigSchema.parse({ ...currentConfig, ...config })
  return currentConfig
}

export function getUserAgent(): string {
  return currentConfig.userAgent
}

export function getReferer(): string {
  return currentConfig.referer
}

export function getProxy(): string | undefined {
  return currentConfig.proxy
}

export function getEncryption(): 'ab' | 'xb' {
  return currentConfig.encryption
}

export function getMsTokenConfig() {
  return currentConfig.msToken
}

export function getTtwidConfig() {
  return currentConfig.ttwid
}

export function getWebidConfig() {
  return currentConfig.webid
}

export { DEFAULT_USER_AGENT }
