import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { AnimatePresence, MotionConfig, motion } from 'motion/react'
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react'
import { AutoResizer } from './components/AutoResizer'
import { AutoTransition } from './components/AutoTransition'
import { CodeScrollArea } from './components/CodeScrollArea'
import { GlobalScrollbars } from './components/GlobalScrollbars'
import './styles.css'

type NewsData = {
  date: string
  content: string[]
  tip?: string
  cover?: string
  image?: string
  created?: string
}

type RouteState = {
  date?: string
  invalidDate: boolean
  clean: boolean
  footerHidden: boolean
  backgroundColor?: string
  textColor?: string
}

type ViewStatus = 'loading' | 'ready' | 'error'
type SearchStatus = 'idle' | 'loading' | 'ready' | 'error'

const MIN_DATE_KEY = '2022-06-04'
const assetUrl = (filePath: string) => `${import.meta.env.BASE_URL}${filePath}`
const yearFormatter = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'long' })

function getBeijingToday() {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date())
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
  return `${values.year}-${values.month}-${values.day}`
}

function normalizeColor(value: string | null) {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  const normalized = /^[\da-f]{3,8}$/i.test(trimmed) ? `#${trimmed}` : trimmed
  if (typeof CSS === 'undefined' || CSS.supports('color', normalized)) return normalized
  return undefined
}

function parseDateParam(value: string | null) {
  if (!value || !/^\d{8}$/.test(value)) return undefined
  const date = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`
  return isValidDateKey(date) ? date : undefined
}

function readRoute(): RouteState {
  const params = new URLSearchParams(window.location.search)
  const rawDate = params.get('date')
  return {
    date: parseDateParam(rawDate),
    invalidDate: Boolean(rawDate && !parseDateParam(rawDate)),
    clean: params.get('style') === 'clean',
    footerHidden: params.get('footer') === 'none',
    backgroundColor: normalizeColor(params.get('backgroundColor')),
    textColor: normalizeColor(params.get('textColor')),
  }
}

function isValidDateKey(dateKey: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return false
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day, 12)
  const isCalendarDate = date.getFullYear() === year
    && date.getMonth() === month - 1
    && date.getDate() === day
  return isCalendarDate && dateKey >= MIN_DATE_KEY && dateKey <= getBeijingToday()
}

function dateKeyFromData(value: string) {
  const dateKey = value.replaceAll('/', '-')
  return isValidDateKey(dateKey) ? dateKey : undefined
}

function formatYearMonth(dateKey: string) {
  const [year, month] = dateKey.split('-').map(Number)
  return yearFormatter.format(new Date(year, month - 1, 1, 12))
}

function getDataPath(dateKey: string) {
  const [year, month, day] = dateKey.split('-')
  return `data/${year}/${month}/${day}.json`
}

function shiftDate(dateKey: string, amount: number) {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day + amount, 12)
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value) => String(value).padStart(2, '0'))
    .join('-')
}

async function fetchNews(url: string) {
  const response = await fetch(assetUrl(url))
  if (!response.ok) throw new Error(`请求返回 ${response.status}`)
  const data = await response.json() as NewsData
  if (!data || !Array.isArray(data.content) || typeof data.date !== 'string') {
    throw new Error('数据格式不完整')
  }
  return data
}

type SearchIndexEntry = { src: string; index: number[] }

async function searchArchive(query: string) {
  const characters = [...query].filter((character) => character.trim() !== '')
  if (characters.length === 0) return []

  const files = await Promise.all(characters.map(async (character) => {
    try {
      const response = await fetch(assetUrl(`search/${encodeURIComponent(character)}.json`))
      if (!response.ok) return [] as SearchIndexEntry[]
      const data = await response.json() as { data?: SearchIndexEntry[] }
      return Array.isArray(data.data) ? data.data : []
    } catch {
      return [] as SearchIndexEntry[]
    }
  }))

  const resultMap = new Map<string, number[][]>()
  files.forEach((entries, characterIndex) => {
    entries.forEach(({ src, index }) => {
      if (!resultMap.has(src)) {
        resultMap.set(src, Array.from({ length: characters.length }, () => []))
      }
      resultMap.get(src)![characterIndex] = index
    })
  })

  return [...resultMap.entries()]
    .filter(([, positions]) => positions.every((item) => item.length > 0))
    .filter(([, positions]) => positions[0].some((position) => (
      positions.slice(1).every((otherPositions, offset) => otherPositions.includes(position + offset + 1))
    )))
    .map(([src]) => src)
    .sort((left, right) => right.localeCompare(left))
}

function highlightText(text: string, query: string): ReactNode {
  const normalizedQuery = [...query].filter((character) => character.trim() !== '').join('')
  if (!normalizedQuery) return text

  const searchableText = text.toLocaleLowerCase()
  const searchableQuery = normalizedQuery.toLocaleLowerCase()
  let matchStart = searchableText.indexOf(searchableQuery)
  if (matchStart === -1) return text

  const pieces: ReactNode[] = []
  let cursor = 0
  let matchIndex = 0

  while (matchStart !== -1) {
    if (matchStart > cursor) pieces.push(text.slice(cursor, matchStart))
    pieces.push(
      <mark className="search-highlight" key={`${matchStart}-${matchIndex}`}>
        {text.slice(matchStart, matchStart + normalizedQuery.length)}
      </mark>,
    )
    cursor = matchStart + normalizedQuery.length
    matchIndex += 1
    matchStart = searchableText.indexOf(searchableQuery, cursor)
  }

  if (cursor < text.length) pieces.push(text.slice(cursor))
  return pieces
}

function GitHubIcon() {
  return (
    <svg className="github-mark" viewBox="0 0 19 19" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M9.356 1.85C5.05 1.85 1.57 5.356 1.57 9.694a7.84 7.84 0 0 0 5.324 7.44c.387.079.528-.168.528-.376 0-.182-.013-.805-.013-1.454-2.165.467-2.616-.935-2.616-.935-.349-.91-.864-1.143-.864-1.143-.71-.48.051-.48.051-.48.787.051 1.2.805 1.2.805.695 1.194 1.817.857 2.268.649.064-.507.27-.857.49-1.052-1.728-.182-3.545-.857-3.545-3.87 0-.857.31-1.558.8-2.104-.078-.195-.349-1 .077-2.078 0 0 .657-.208 2.14.805a7.5 7.5 0 0 1 1.946-.26c.657 0 1.328.092 1.946.26 1.483-1.013 2.14-.805 2.14-.805.426 1.078.155 1.883.078 2.078.502.546.799 1.247.799 2.104 0 3.013-1.818 3.675-3.558 3.87.284.247.528.714.528 1.454 0 1.052-.012 1.896-.012 2.156 0 .208.142.455.528.377a7.84 7.84 0 0 0 5.324-7.441c.013-4.338-3.48-7.844-7.773-7.844"
        clipRule="evenodd"
      />
    </svg>
  )
}

function App() {
  const [route, setRoute] = useState<RouteState>(() => readRoute())
  const [news, setNews] = useState<NewsData | null>(null)
  const [viewStatus, setViewStatus] = useState<ViewStatus>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [retryToken, setRetryToken] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [highlightQuery, setHighlightQuery] = useState('')
  const [searchResults, setSearchResults] = useState<string[] | null>(null)
  const [searchStatus, setSearchStatus] = useState<SearchStatus>('idle')
  const [searchError, setSearchError] = useState('')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchRevisionRef = useRef(0)

  const newsDateKey = news ? dateKeyFromData(news.date) : route.date
  const today = getBeijingToday()
  const themeStyle = useMemo(() => ({
    '--page-bg': route.backgroundColor,
    '--ink': route.textColor,
    '--accent': route.textColor ?? '#468282',
  }) as CSSProperties, [route.backgroundColor, route.textColor])

  useEffect(() => {
    if (!isSettingsOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isSettingsOpen])

  const loadRoute = useCallback(() => {
    setRoute(readRoute())
  }, [])

  useEffect(() => {
    window.addEventListener('popstate', loadRoute)
    return () => window.removeEventListener('popstate', loadRoute)
  }, [loadRoute])

  useEffect(() => {
    if (route.invalidDate) {
      setViewStatus('error')
      setErrorMessage(`日期无效，请使用 ${MIN_DATE_KEY.replaceAll('-', '')} 之后的日期。`)
      return
    }

    let cancelled = false
    setViewStatus('loading')
    setErrorMessage('')
    setNews(null)

    fetchNews(route.date ? getDataPath(route.date) : 'latest.json')
      .then((data) => {
        if (cancelled) return
        setNews(data)
        setViewStatus('ready')
      })
      .catch((error: Error) => {
        if (cancelled) return
        setErrorMessage(error.message || '暂时无法获取新闻。')
        setViewStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [retryToken, route.date, route.invalidDate])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchInputRef.current?.focus()
      } else if (event.key === '/' && !isTyping) {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const navigateToDate = (dateKey: string, nextHighlightQuery = '') => {
    const url = new URL(window.location.href)
    url.searchParams.set('date', dateKey.replaceAll('-', ''))
    window.history.pushState({}, '', url)
    setSearchResults(null)
    setSearchStatus('idle')
    setHighlightQuery(nextHighlightQuery)
    setRoute(readRoute())
  }

  const handleDateInput = (value: string) => {
    if (isValidDateKey(value)) navigateToDate(value)
  }

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = searchQuery.trim()
    if (!query) {
      setSearchResults(null)
      setSearchStatus('idle')
      setHighlightQuery('')
      return
    }

    const revision = ++searchRevisionRef.current
    setSearchStatus('loading')
    setSearchError('')
    setSearchResults([])
    setHighlightQuery('')
    try {
      const results = await searchArchive(query)
      if (revision !== searchRevisionRef.current) return
      setSearchResults(results)
      setSearchStatus('ready')
    } catch (error) {
      if (revision !== searchRevisionRef.current) return
      setSearchError(error instanceof Error ? error.message : '搜索失败')
      setSearchStatus('error')
    }
  }

  const clearSearch = () => {
    searchRevisionRef.current += 1
    setSearchQuery('')
    setSearchResults(null)
    setSearchStatus('idle')
    setSearchError('')
    setHighlightQuery('')
    searchInputRef.current?.focus()
  }

  const previousDate = newsDateKey ? shiftDate(newsDateKey, -1) : undefined
  const nextDate = newsDateKey ? shiftDate(newsDateKey, 1) : undefined
  const hasPreviousDate = Boolean(previousDate && previousDate >= MIN_DATE_KEY)
  const hasNextDate = Boolean(nextDate && nextDate <= today)

  const pageClassName = [
    'page-shell',
    route.clean ? 'clean-mode' : '',
  ].filter(Boolean).join(' ')
  const readingTransitionKey = searchResults !== null
    ? `search-${searchStatus}-${searchResults.length}`
    : viewStatus === 'ready' && newsDateKey
      ? `news-${newsDateKey}`
      : viewStatus

  return (
    <MotionConfig reducedMotion="user">
      <GlobalScrollbars />
      <div className={pageClassName} style={themeStyle}>
        <div className="ambient-orb ambient-orb-one" aria-hidden="true" />
        <div className="ambient-orb ambient-orb-two" aria-hidden="true" />

        <main className="news-workbench">
          <section className="hero" aria-labelledby="page-title">
            <a className="site-title-link" href="https://news.ravelloh.top" aria-label="打开 EverydayNews">
              <h1 id="page-title">Everyday<span>News</span></h1>
            </a>
          </section>

          <section className="control-deck" aria-label="新闻控制台">
            <form className="search-form" onSubmit={handleSearch} role="search">
              <Search size={17} strokeWidth={1.8} aria-hidden="true" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') clearSearch()
                }}
                placeholder="搜索..."
                aria-label="搜索新闻关键词"
              />
              {searchQuery ? (
                <button className="clear-search" type="button" onClick={clearSearch} aria-label="清除搜索">
                  <X size={15} strokeWidth={2} aria-hidden="true" />
                </button>
              ) : <kbd>/</kbd>}
              <button className="search-submit" type="submit" aria-label="搜索" title="搜索">
                <Search size={19} strokeWidth={1.9} aria-hidden="true" />
              </button>
            </form>

          </section>

          <section className="archive-layout" aria-live="polite">
            <aside className="archive-rail" aria-label="档案信息">
              <span className="rail-line" aria-hidden="true" />
              <span className="rail-label">DAILY<br />ARCHIVE</span>
              <span className="rail-year">{newsDateKey ? formatYearMonth(newsDateKey) : '—'}</span>
            </aside>

            <div className="reading-column">
              <AutoResizer className="reading-resizer" duration={0.26} initial>
                <AutoTransition className="reading-transition" duration={0.2} initial={false} type="slideUp" transitionKey={readingTransitionKey}>
                {searchResults !== null ? (
                  <section className="search-results-panel">
                    <div className="section-heading">
                      <div>
                        <span className="section-kicker">SEARCH / {searchStatus === 'loading' ? 'RUNNING' : 'ARCHIVE'}</span>
                        <h2>搜索结果</h2>
                      </div>
                      <span className="result-count">{searchStatus === 'loading' ? '查询中…' : `${searchResults.length} 个日期`}</span>
                    </div>
                    {searchStatus === 'loading' ? (
                      <div className="result-loading" role="status" aria-live="polite">
                        <LoaderCircle className="loading-spinner" size={19} strokeWidth={1.7} aria-hidden="true" />
                        <span>正在检索档案索引…</span>
                      </div>
                    ) : searchStatus === 'error' ? (
                      <div className="state-panel error-state" role="alert">
                        <CircleAlert size={20} strokeWidth={1.8} aria-hidden="true" />
                        <span>{searchError}</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="state-panel empty-state">
                        <span>没有找到包含“{searchQuery}”的日期。</span>
                      </div>
                    ) : (
                      <div className="result-grid" aria-label="搜索结果日期">
                        {searchResults.map((result) => (
                          <button
                            className="result-chip"
                            key={result}
                            type="button"
                            onClick={() => navigateToDate(result.replaceAll('/', '-'), searchQuery)}
                          >
                            {result.replaceAll('/', '-')}
                          </button>
                        ))}
                      </div>
                    )}
                  </section>
                ) : viewStatus === 'loading' ? (
                  <div className="result-loading large-state" role="status" aria-live="polite">
                    <LoaderCircle className="loading-spinner" size={19} strokeWidth={1.7} aria-hidden="true" />
                    <span>正在打开今日档案…</span>
                  </div>
                ) : viewStatus === 'error' ? (
                  <div className="state-panel large-state error-state" role="alert">
                    <CircleAlert size={22} strokeWidth={1.7} aria-hidden="true" />
                    <div>
                      <strong>这一天暂时无法打开</strong>
                      <span>{errorMessage}</span>
                      <button className="text-button" type="button" onClick={() => setRetryToken((value) => value + 1)}>重新加载</button>
                    </div>
                  </div>
                ) : news && newsDateKey ? (
                  <article className="reading-card">
                    <header className="reading-header">
                      <div>
                        <span className="section-kicker">{newsDateKey === today ? 'TODAY / 60S BRIEF' : 'ARCHIVE / 60S BRIEF'}</span>
                        <h2>日期: {news.date}</h2>
                      </div>
                      <div className="reading-stat">
                        <strong>{String(news.content.length).padStart(2, '0')}</strong>
                        <span>条新闻</span>
                      </div>
                    </header>

                    {news.tip ? <blockquote className="daily-tip">“{news.tip}”</blockquote> : null}

                    <ul className="news-list">
                      {news.content.map((item, index) => (
                        <li key={`${newsDateKey}-${index}`}>
                          <span className="news-index">{String(index + 1).padStart(2, '0')}</span>
                          <p>{highlightText(item, highlightQuery)}</p>
                        </li>
                      ))}
                    </ul>

                    <footer className="reading-footer">
                      <span>{news.created ? `更新于 ${news.created}` : 'EverydayNews archive'}</span>
                      <span className="footer-rule" aria-hidden="true" />
                      <span>{newsDateKey.replaceAll('-', '/')}</span>
                    </footer>
                  </article>
                ) : null}
                </AutoTransition>
              </AutoResizer>
            </div>
          </section>

          <div className="date-controls">
            <div className="date-label">
              <CalendarDays size={16} strokeWidth={1.8} aria-hidden="true" />
              <span>选择日期:</span>
            </div>
            <button className="round-button" type="button" onClick={() => previousDate && navigateToDate(previousDate)} disabled={!hasPreviousDate} aria-label="前一天" title="前一天">
              <ChevronLeft size={17} strokeWidth={1.8} aria-hidden="true" />
            </button>
            <input
              className="date-input"
              type="date"
              min={MIN_DATE_KEY}
              max={today}
              value={newsDateKey ?? ''}
              onChange={(event) => handleDateInput(event.target.value)}
              aria-label="选择阅读日期"
            />
            <button className="round-button" type="button" onClick={() => nextDate && navigateToDate(nextDate)} disabled={!hasNextDate} aria-label="后一天" title="后一天">
              <ChevronRight size={17} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </main>

        {!route.footerHidden ? (
          <footer className="site-footer">
            <p className="footer-links">
              <a href="https://github.com/RavelloH/EverydayNews" target="_blank" rel="noreferrer" aria-label="在 GitHub 查看 RavelloH/EverydayNews" title="GitHub">
                <GitHubIcon />
                <span>RavelloH/EverydayNews</span>
              </a>
              {' · '}
              <a href={assetUrl('rss.xml')} rel="alternate" type="application/rss+xml">RSS</a>
              {' · '}
              <button className="settings-trigger" type="button" onClick={() => setIsSettingsOpen(true)}>
                <SlidersHorizontal size={14} strokeWidth={1.8} aria-hidden="true" />
                <span>设置</span>
              </button>
            </p>
            <AnimatePresence initial={false}>
              {isSettingsOpen ? (
                <motion.div
                  className="dialog-backdrop"
                  role="presentation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  onMouseDown={() => setIsSettingsOpen(false)}
                >
                  <motion.section
                    className="product-dialog"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="settings-dialog-title"
                    initial={{ opacity: 0, y: 8, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.985 }}
                    transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                    onMouseDown={(event) => event.stopPropagation()}
                  >
                    <div className="dialog-heading">
                      <div>
                        <p className="eyebrow">QUERY PARAMETERS</p>
                        <h2 id="settings-dialog-title">设置</h2>
                      </div>
                      <button className="dialog-close" type="button" onClick={() => setIsSettingsOpen(false)} aria-label="关闭" title="关闭">
                        <X size={19} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    </div>
                    <div className="settings-copy">
                      <p>支持的参数:</p>
                      <ul>
                        <li><code>date</code>：日期，格式为 YYYYMMDD</li>
                        <li><code>style=clean</code>：简化模式</li>
                        <li><code>footer=none</code>：隐藏页脚</li>
                        <li><code>backgroundColor</code>：背景色</li>
                        <li><code>textColor</code>：文字颜色</li>
                      </ul>
                      <p>例如:</p>
                      <ul>
                        <li><a href="?style=clean">?style=clean</a></li>
                        <li><a href="?footer=none">?footer=none</a></li>
                        <li><a href="?style=clean&footer=none">?style=clean&footer=none</a></li>
                        <li><a href="?date=20220604">?date=20220604</a></li>
                        <li><a href="?date=20220604&backgroundColor=111111&textColor=ffffff">?backgroundColor=111111&textColor=ffffff</a></li>
                      </ul>
                      <hr />
                      <p>推荐将本站使用 iframe 挂载到你的网站上:</p>
                      <CodeScrollArea>
                        <code>&lt;iframe src="https://ravelloh.github.io/EverydayNews?style=clean" width="600" height="800" frameborder="0"&gt;&lt;/iframe&gt;</code>
                      </CodeScrollArea>
                    </div>
                  </motion.section>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </footer>
        ) : null}
      </div>
    </MotionConfig>
  )
}

export default App
