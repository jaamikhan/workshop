import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDownWideNarrow, ArrowRight, AudioLines, Bolt, CalendarDays, Check,
  ChevronDown, CircleHelp, Clock3, Compass, ExternalLink, Filter, MapPin,
  Palette, RefreshCw, Search, Sparkles, Ticket, Users, X,
} from 'lucide-react'

const API_URL = (import.meta.env.VITE_API_URL || 'https://workshop-4heo.onrender.com').replace(/\/$/, '')
const categories = [
  { id: 'all', label: 'All events', icon: Compass },
  { id: 'tech', label: 'Tech & coding', icon: Bolt },
  { id: 'arts', label: 'Arts & design', icon: Palette },
  { id: 'career', label: 'Career & fairs', icon: ArrowDownWideNarrow },
  { id: 'social', label: 'Social & music', icon: AudioLines },
  { id: 'sports', label: 'Sports & rec', icon: Users },
]
const photos = [
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=85',
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1000&q=85',
]

function first(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function normalizeEvent(event, index) {
  const date = first(event.date, event.event_date, event.starts_at, event.start_date, event.datetime)
  const dateObject = date ? new Date(date) : null
  const validDate = dateObject && !Number.isNaN(dateObject.getTime())
  const category = String(first(event.category, event.type, event.event_type, 'Campus')).toLowerCase()
  return {
    ...event,
    id: first(event.id, event.event_id, index),
    title: first(event.title, event.name, event.event_name, 'Campus event'),
    description: first(event.description, event.details, event.summary, 'Join your campus community for this upcoming event.'),
    venue: first(event.location, event.venue, event.place, event.building, 'Campus location'),
    category,
    dateObject: validDate ? dateObject : null,
    image: first(event.image_url, event.image, event.banner_url, photos[index % photos.length]),
    capacity: Number(first(event.capacity, 0)) || 0,
    attendeeCount: Number(first(event.registration_count, event.attendee_count, event.registered_count, 0)) || 0,
    startTime: first(event.start_time, event.time, validDate ? dateObject.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''),
    status: String(first(event.status, 'open')).toLowerCase(),
  }
}

function formatDate(date) {
  if (!date) return { month: 'DATE', day: '—', full: 'Date to be announced' }
  return {
    month: date.toLocaleDateString([], { month: 'short' }).toUpperCase(),
    day: date.toLocaleDateString([], { day: '2-digit' }),
    full: date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
  }
}

function matchesCategory(event, category) {
  if (category === 'all') return true
  const value = event.category
  if (category === 'tech') return /tech|coding|computer|software|science|hack/i.test(value)
  if (category === 'arts') return /art|design|craft|ceramic|paint|photo/i.test(value)
  if (category === 'career') return /career|fair|job|professional|business/i.test(value)
  if (category === 'social') return /social|music|party|culture|community/i.test(value)
  if (category === 'sports') return /sport|rec|fitness|game|athletic/i.test(value)
  return true
}

export default function App() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [dateRange, setDateRange] = useState('all')
  const [userRole, setUserRole] = useState(() => localStorage.getItem('campuspulse-role') || 'student')
  const [userId, setUserId] = useState('')
  const [userOptions, setUserOptions] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  const [usersError, setUsersError] = useState('')
  const [usersReload, setUsersReload] = useState(0)
  const [registering, setRegistering] = useState('')
  const [registeredIds, setRegisteredIds] = useState(() => new Set())
  const [notice, setNotice] = useState(null)
  const [view, setView] = useState('events')
  const [passes, setPasses] = useState([])
  const [passesLoading, setPassesLoading] = useState(false)
  const [organizerEventId, setOrganizerEventId] = useState('')
  const [attendees, setAttendees] = useState(null)
  const [attendeesLoading, setAttendeesLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [apiReferenceOpen, setApiReferenceOpen] = useState(false)

  async function loadEvents() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/api/events`)
      if (!response.ok) throw new Error(`Events request failed (${response.status})`)
      const body = await response.json()
      if (!Array.isArray(body.events)) throw new Error('The events API response did not include an events list.')
      setEvents(body.events.map(normalizeEvent))
    } catch (err) {
      setError(err.message || 'Could not connect to the events service.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadEvents() }, [])

  useEffect(() => {
    let active = true
    setUsersLoading(true)
    setUsersError('')
    fetch(`${API_URL}/api/users?role=${encodeURIComponent(userRole)}`)
      .then(async (response) => {
        const body = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(body.error || `ID list request failed (${response.status})`)
        return Array.isArray(body.users) ? body.users : []
      })
      .then((users) => {
        if (!active) return
        setUserOptions(users)
        const savedId = localStorage.getItem(`campuspulse-${userRole}-id`) || (userRole === 'student' ? localStorage.getItem('campuspulse-user-id') : '')
        const selectedId = users.some((user) => user.id === savedId) ? savedId : ''
        setUserId(selectedId)
        if (!selectedId) {
          localStorage.removeItem(`campuspulse-${userRole}-id`)
          if (userRole === 'student') localStorage.removeItem('campuspulse-user-id')
        }
      })
      .catch((err) => { if (active) { setUserOptions([]); setUserId(''); setUsersError(err.message || 'Could not load IDs from the backend.') } })
      .finally(() => { if (active) setUsersLoading(false) })
    return () => { active = false }
  }, [userRole, usersReload])

  const filteredEvents = useMemo(() => events.filter((event) => {
    const text = `${event.title} ${event.description} ${event.venue} ${event.category}`.toLowerCase()
    if (query && !text.includes(query.toLowerCase())) return false
    if (!matchesCategory(event, category)) return false
    if (dateRange !== 'all' && event.dateObject) {
      const today = new Date(); today.setHours(0, 0, 0, 0)
      const days = Math.ceil((event.dateObject - today) / 86400000)
      if (days < 0) return false
      if (dateRange === 'week' && days > 7) return false
      if (dateRange === 'month' && event.dateObject.getMonth() !== today.getMonth()) return false
    }
    return true
  }), [events, query, category, dateRange])

  function changeRole(role) {
    setUserRole(role)
    localStorage.setItem('campuspulse-role', role)
    setUserId('')
  }

  function changeSelectedId(value) {
    setUserId(value)
    if (value) {
      localStorage.setItem(`campuspulse-${userRole}-id`, value)
      if (userRole === 'student') localStorage.setItem('campuspulse-user-id', value)
    } else {
      localStorage.removeItem(`campuspulse-${userRole}-id`)
      if (userRole === 'student') localStorage.removeItem('campuspulse-user-id')
    }
  }

  async function register(event) {
    if (!userId) {
      setNotice({ type: 'error', text: usersError ? 'The backend ID list is unavailable. Redeploy the backend API, then refresh IDs.' : 'Choose your user ID from the ID dropdown first.' })
      return
    }
    setRegistering(String(event.id))
    setNotice(null)
    try {
      const response = await fetch(`${API_URL}/api/registrations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, event_id: event.id }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || `Registration failed (${response.status})`)
      setRegisteredIds((current) => new Set([...current, String(event.id)]))
      setNotice({ type: 'success', text: `You’re registered for ${event.title}.` })
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Registration failed. Please try again.' })
    } finally {
      setRegistering('')
    }
  }

  async function loadPasses() {
    if (!userId) {
      setNotice({ type: 'error', text: usersError ? 'The backend ID list is unavailable. Redeploy the backend API, then refresh IDs.' : 'Choose your user ID from the ID dropdown first.' })
      return
    }
    setView('passes')
    setPassesLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/me/registrations?user_id=${encodeURIComponent(userId)}`)
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || `Registrations request failed (${response.status})`)
      setPasses(Array.isArray(body.registrations) ? body.registrations : [])
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Could not load your registrations.' })
      setPasses([])
    } finally {
      setPassesLoading(false)
    }
  }

  async function loadAttendees(event) {
    event.preventDefault()
    if (!userId) {
      setNotice({ type: 'error', text: usersError ? 'The backend ID list is unavailable. Redeploy the backend API, then refresh IDs.' : 'Choose your organiser ID from the ID dropdown first.' })
      return
    }
    setAttendeesLoading(true)
    setAttendees(null)
    try {
      const response = await fetch(`${API_URL}/api/events/${encodeURIComponent(organizerEventId.trim())}/registrations?user_id=${encodeURIComponent(userId)}`)
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || `Attendee request failed (${response.status})`)
      setAttendees(Array.isArray(body.registrations) ? body.registrations : [])
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Could not load attendees.' })
    } finally {
      setAttendeesLoading(false)
    }
  }

  async function showEventDetails(event) {
    setSelectedEvent({ loading: true })
    try {
      const response = await fetch(`${API_URL}/api/events/${encodeURIComponent(event.id)}`)
      const body = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(body.error || `Event request failed (${response.status})`)
      setSelectedEvent({ event: normalizeEvent(body.event || event, 0) })
    } catch (err) {
      setSelectedEvent({ error: err.message || 'Could not load event details.' })
    }
  }

  function navigate(destination) {
    if (destination === 'passes') loadPasses()
    else setView(destination)
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label="CampusPulse home"><span className="brand-mark"><Bolt size={22} fill="currentColor" /></span><span>Campus<span>Pulse</span></span></a>
          <nav className="desktop-nav" aria-label="Main navigation"><button className={view === 'events' ? 'active' : ''} onClick={() => navigate('events')}>Explore events</button><button className={view === 'passes' ? 'active' : ''} onClick={() => navigate('passes')}>My passes</button><button className={view === 'organizer' ? 'active' : ''} onClick={() => navigate('organizer')}>Organizer studio</button></nav>
          <div className="profile-area role-controls"><label className="role-select"><span>Role</span><select value={userRole} onChange={(event) => changeRole(event.target.value)} aria-label="Select role"><option value="student">Student</option><option value="organizer">Organiser</option><option value="admin">Admin</option></select><ChevronDown size={13}/></label><label className="id-select"><span>ID</span><select value={userId} onChange={(event) => changeSelectedId(event.target.value)} aria-label={`${userRole} ID`} title={usersError}><option value="">{usersLoading ? 'Loading IDs…' : usersError ? 'Backend unavailable' : userOptions.length ? 'Choose ID' : 'No IDs found'}</option>{userOptions.map((user) => <option key={user.id} value={user.id}>{user.id}</option>)}</select><ChevronDown size={13}/></label><button className="refresh-ids" type="button" onClick={() => setUsersReload((count) => count + 1)} aria-label="Refresh IDs from backend" title={usersError || 'Refresh IDs from backend'} disabled={usersLoading}><RefreshCw size={14}/></button>{usersError && <span className="id-fetch-error" title={usersError}>Deploy backend for IDs</span>}</div>
        </div>
      </header>
      <main id="top">
        <section className="hero">
          <div className="hero-orb orb-one"/><div className="hero-orb orb-two"/>
          <div className="hero-content">
            <div className="hero-meta"><span className="persona"><span className="pulse-dot"/> CAMPUS LIFE, IN ONE PLACE <span className="persona-divider">·</span><b>STUDENT VIEW</b></span><span className="api-status"><span className="method">GET</span> /api/events <span className="online-dot"/></span></div>
            <div className="hero-copy"><span className="eyebrow">FIND YOUR NEXT FAVORITE</span><h1>Discover & join<br className="desktop-break"/> campus life.</h1><p>Meet your people, learn something new, and make the most of what’s happening around campus.</p></div>
            <div className="search-panel">
              <label className="search-box"><Search size={20}/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search events, clubs, places…" aria-label="Search events"/>{query && <button className="clear-search" onClick={() => setQuery('')} aria-label="Clear search"><X size={16}/></button>}</label>
              <label className="select-box"><CalendarDays size={18}/><select value={dateRange} onChange={(event) => setDateRange(event.target.value)} aria-label="Filter dates"><option value="all">Any date</option><option value="week">Next 7 days</option><option value="month">This month</option></select><ChevronDown size={16}/></label>
              <button className="refresh-button" onClick={loadEvents} title="Refresh events" aria-label="Refresh events"><RefreshCw size={18}/></button>
            </div>
            <div className="category-row" role="group" aria-label="Filter by category">{categories.map(({ id, label, icon: Icon }) => <button key={id} className={`category-chip ${category === id ? 'selected' : ''}`} onClick={() => setCategory(id)}>{id !== 'all' && <Icon size={15}/>} {label}</button>)}</div>
          </div>
        </section>
        {view === 'events' && <section className="content-wrap" id="events">
          <div className="section-heading"><div><div className="section-kicker"><Sparkles size={14}/> YOUR CAMPUS, HAPPENING</div><h2>Events worth showing up for</h2><p>{loading ? 'Checking what’s on…' : `${filteredEvents.length} ${filteredEvents.length === 1 ? 'event' : 'events'} to explore`}</p></div><div className="sort-label"><Filter size={15}/> Upcoming</div></div>
          {error && <div className="state-card error-card"><div className="state-icon"><CircleHelp size={21}/></div><div><strong>We couldn’t load events</strong><p>{error}. Check that the API is awake and reachable.</p></div><button className="outline-button" onClick={loadEvents}>Try again <ArrowRight size={15}/></button></div>}
          {loading && !error && <div className="event-grid">{[1, 2, 3].map((item) => <div className="skeleton-card" key={item}><div className="skeleton-image"/><div className="skeleton-lines"><i/><i/><i/></div></div>)}</div>}
          {!loading && !error && filteredEvents.length === 0 && <div className="state-card empty-card"><div className="state-icon"><Compass size={21}/></div><div><strong>{events.length ? 'No events match those filters' : 'The campus calendar is quiet'}</strong><p>{events.length ? 'Try another search or clear a category filter.' : 'Check back soon for new events.'}</p></div>{events.length > 0 && <button className="outline-button" onClick={() => { setQuery(''); setCategory('all'); setDateRange('all') }}>Clear filters <X size={15}/></button>}</div>}
          {!loading && filteredEvents.length > 0 && <div className="event-grid">{filteredEvents.map((event, index) => {
            const date = formatDate(event.dateObject)
            const full = event.capacity > 0 && event.attendeeCount >= event.capacity
            const almostFull = event.capacity > 0 && event.capacity - event.attendeeCount <= Math.max(5, event.capacity * .12)
            const isRegistered = registeredIds.has(String(event.id))
            const categoryName = event.category.charAt(0).toUpperCase() + event.category.slice(1)
            return <article className="event-card" key={event.id}>
              <div className="card-image-wrap"><img className="card-image" src={event.image} alt="" loading="lazy"/><div className="date-stamp"><span>{date.month}</span><b>{date.day}</b></div><span className="category-badge"><span className="badge-dot"/>{categoryName}</span>{almostFull && !full && <span className="almost-badge">Filling fast</span>}</div>
              <div className="card-body"><div className="event-location"><MapPin size={15}/><span>{event.venue}</span></div><button className="event-title-button" onClick={() => showEventDetails(event)}><h3>{event.title}</h3></button><p className="event-description">{event.description}</p>
                {event.capacity > 0 && <div className={`capacity-box ${almostFull ? 'near-capacity' : ''}`}><div className="capacity-label"><span>{full ? 'At capacity' : 'Spots claimed'}</span><b>{event.attendeeCount} / {event.capacity}</b></div><div className="progress-track"><i style={{ width: `${Math.min(100, event.attendeeCount / event.capacity * 100)}%` }}/></div></div>}
                <div className="card-footer"><span className="event-time"><Clock3 size={15}/>{date.full}{event.startTime && <> <span className="time-divider">·</span> {event.startTime}</>}</span><button className={`register-button ${isRegistered ? 'registered' : ''}`} disabled={!!registering || full || isRegistered || !['open', 'published', 'active'].includes(event.status)} onClick={() => register(event)}>{registering === String(event.id) ? <><span className="spinner"/> Joining…</> : isRegistered ? <><Check size={16}/> Registered</> : full ? 'Full' : !['open', 'published', 'active'].includes(event.status) ? 'Closed' : <>Join event <ArrowRight size={16}/></>}</button></div>
              </div>
            </article>
          })}</div>}
          <aside className="bottom-note"><span className="note-icon"><Ticket size={17}/></span><span><b>Good things happen when you show up.</b> Your next connection might be one event away.</span><ExternalLink size={15}/></aside>
        </section>}
        {view === 'passes' && <section className="content-wrap secondary-view"><div className="section-heading"><div><div className="section-kicker"><Ticket size={14}/> YOUR EVENT WALLET</div><h2>My registrations</h2><p>Events connected to your campus user ID.</p></div><button className="outline-button" onClick={loadPasses}><RefreshCw size={15}/> Refresh</button></div>{passesLoading ? <div className="state-card">Loading your registrations…</div> : passes.length === 0 ? <div className="state-card empty-card"><div className="state-icon"><Ticket size={21}/></div><div><strong>No registrations yet</strong><p>When you join an event, it will appear here.</p></div><button className="outline-button" onClick={() => setView('events')}>Explore events <ArrowRight size={15}/></button></div> : <div className="pass-list">{passes.map((registration, index) => { const event = registration.events || {}; const title = first(event.title, event.name, 'Campus event'); return <article className="pass-card" key={registration.id || `${registration.event_id}-${index}`}><span className="pass-icon"><Ticket size={20}/></span><div><h3>{title}</h3><p><MapPin size={14}/> {first(event.location, event.venue, 'Campus location')}</p><small>Registration {registration.id ? `#${registration.id}` : 'confirmed'}</small></div><span className="pass-status"><Check size={14}/> Registered</span></article> })}</div>}</section>}
        {view === 'organizer' && <section className="content-wrap secondary-view"><div className="section-heading"><div><div className="section-kicker"><Users size={14}/> ORGANIZER TOOLS</div><h2>Attendee lookup</h2><p>View registrations for an event you organize.</p></div></div><form className="lookup-form" onSubmit={loadAttendees}><label htmlFor="event-id">Event ID</label><div className="lookup-controls"><input id="event-id" value={organizerEventId} onChange={(event) => setOrganizerEventId(event.target.value)} placeholder="Enter the event UUID" required/><button className="save-button" disabled={attendeesLoading}>{attendeesLoading ? 'Loading…' : <>View attendees <ArrowRight size={16}/></>}</button></div><small>This endpoint checks that your user ID matches the event organizer.</small></form>{attendees && <div className="attendee-results"><h3>{attendees.length} {attendees.length === 1 ? 'attendee' : 'attendees'}</h3>{attendees.length ? attendees.map((row, index) => <div className="attendee-row" key={row.id || index}><span className="avatar"><Users size={14}/></span><span>{first(row.users?.email, row.user_id, 'Campus user')}</span><small>{first(row.users?.role, 'student')}</small></div>) : <p>No registrations yet.</p>}</div>}</section>}
      </main>
      <footer className="footer"><a className="brand footer-brand" href="#top"><span className="brand-mark"><Bolt size={17} fill="currentColor"/></span><span>Campus<span>Pulse</span></span></a><span>Made for campus life <span className="footer-heart">✳</span></span><button className="api-reference-link" onClick={() => setApiReferenceOpen(true)}>Backend API reference <ExternalLink size={13}/></button></footer>
      {selectedEvent && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedEvent(null) }}><div className="student-modal detail-modal"><button className="modal-close" onClick={() => setSelectedEvent(null)} aria-label="Close"><X size={18}/></button>{selectedEvent.loading ? <p>Loading event details…</p> : selectedEvent.error ? <p>{selectedEvent.error}</p> : <><img src={selectedEvent.event.image} alt=""/><span className="eyebrow">EVENT DETAILS</span><h2>{selectedEvent.event.title}</h2><p>{selectedEvent.event.description}</p><div className="detail-meta"><span><CalendarDays size={15}/> {formatDate(selectedEvent.event.dateObject).full}</span><span><MapPin size={15}/> {selectedEvent.event.venue}</span></div><button className="save-button" onClick={() => { setSelectedEvent(null); register(selectedEvent.event) }}>Register for event <ArrowRight size={16}/></button></>}</div></div>}
      {apiReferenceOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setApiReferenceOpen(false) }}><div className="student-modal api-modal"><button className="modal-close" onClick={() => setApiReferenceOpen(false)} aria-label="Close"><X size={18}/></button><span className="eyebrow">CONNECTED SERVICE</span><h2>Backend API</h2><p>Requests use <b>{API_URL}</b>. This route reference is from the backend API screenshot.</p><img src="/api-reference.jpeg" alt="Backend API methods and endpoint reference"/></div></div>}
      {notice && <div className={`toast ${notice.type}`} role="status"><span>{notice.type === 'success' ? <Check size={19}/> : <CircleHelp size={19}/>}</span><p>{notice.text}</p><button onClick={() => setNotice(null)} aria-label="Dismiss message"><X size={17}/></button></div>}
    </>
  )
}
