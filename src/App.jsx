import { useState, useMemo } from 'react'
import data from './calendar_data.json'
import './index.css'

const monthMap = {
  'abril': { m: 3, y: 2026 },
  'maig': { m: 4, y: 2026 },
  'juny': { m: 5, y: 2026 },
  'juliol': { m: 6, y: 2026 },
  'agost': { m: 7, y: 2026 },
  'setembre': { m: 8, y: 2026 },
  'set': { m: 8, y: 2026 },
};

function parseDates(monthStr, dateStr) {
  if (!monthStr || monthStr === 'Desconegut') return [];
  const mLow = monthStr.toLowerCase().trim();
  const monthInfo = monthMap[mLow] || monthMap[Object.keys(monthMap).find(k => mLow.includes(k))];
  
  if (!monthInfo) return [];

  const year = monthInfo.y;
  const month = monthInfo.m;

  const dateMatch = dateStr.match(/\d+/g);
  if (!dateMatch) return [];

  let days = [];
  
  const formatDate = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  if (dateStr.includes('al') || dateStr.includes("a l'")) {
    if (dateMatch.length >= 2) {
      let startDay = parseInt(dateMatch[0], 10);
      let endDay = parseInt(dateMatch[1], 10);
      
      // Handle cross-month like "26 a l'1"
      if (startDay > endDay) {
        // days in current month
        let maxDaysInMonth = new Date(year, month + 1, 0).getDate();
        for (let d = startDay; d <= maxDaysInMonth; d++) {
          days.push(formatDate(year, month, d));
        }
        // days in next month
        for (let d = 1; d <= endDay; d++) {
          days.push(formatDate(year, month + 1, d));
        }
      } else {
        for (let d = startDay; d <= endDay; d++) {
          days.push(formatDate(year, month, d));
        }
      }
    }
  } else if (dateMatch.length === 1) {
    let day = parseInt(dateMatch[0], 10);
    days.push(formatDate(year, month, day));
  } else {
    // If multiple numbers like "20, 21"
    dateMatch.forEach(dStr => {
      days.push(formatDate(year, month, parseInt(dStr, 10)));
    });
  }

  return days;
}

function App() {
  const [filters, setFilters] = useState({
    'ESO': true,
    '1 BTX': true,
    '2 BTX': true,
    'CF': true,
    'PFI': true,
  });

  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Start at May 2026
  const [selectedDayISO, setSelectedDayISO] = useState(null);

  const toggleFilter = (group) => {
    setFilters(prev => ({ ...prev, [group]: !prev[group] }));
  };

  // Process events
  const processedEvents = useMemo(() => {
    let eventsByDayISO = {};
    let allValidEvents = [];

    data.forEach(ev => {
      if (!filters[ev.group]) return;

      const activeDays = parseDates(ev.month, ev.date);
      activeDays.forEach(isoDate => {
        if (!eventsByDayISO[isoDate]) eventsByDayISO[isoDate] = [];
        // Avoid adding exact duplicates for the same day
        const isDup = eventsByDayISO[isoDate].some(e => e.id === ev.id);
        if (!isDup) {
            eventsByDayISO[isoDate].push({ ...ev, activeIso: isoDate });
            allValidEvents.push({ ...ev, activeIso: isoDate });
        }
      });
    });

    return { eventsByDayISO, allValidEvents };
  }, [filters]);

  const getGroupClass = (group) => {
    if (group.includes('ESO')) return 'eso';
    if (group.includes('1 BTX')) return 'btx1';
    if (group.includes('2 BTX')) return 'btx2';
    if (group.includes('CF')) return 'cf';
    if (group.includes('PFI')) return 'pfi';
    return '';
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const prevMonth = () => setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

  // Calendar calculations
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

  const monthNames = ["Gener", "Febrer", "Març", "Abril", "Maig", "Juny", "Juliol", "Agost", "Setembre", "Octubre", "Novembre", "Desembre"];

  const generateDays = () => {
    const cells = [];
    for (let i = 0; i < startOffset; i++) {
      cells.push(<div key={`empty-${i}`} className="day-cell empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      // toISOString uses UTC, so we create a local date string manually
      const isoDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      const dayEvents = processedEvents.eventsByDayISO[isoDate] || [];
      
      const isSelected = selectedDayISO === isoDate;

      // Check for special badges
      const hasNotes = dayEvents.some(ev => 
        ev.description.toLowerCase().includes('entrada notes') || 
        ev.description.toLowerCase().includes('límit entrada notes')
      );
      const hasJuntes = dayEvents.some(ev => 
        ev.description.toLowerCase().includes('avaluació final') || 
        ev.description.toLowerCase().includes('junta d\'avaluació') ||
        ev.description.toLowerCase().includes('avaluació ordinària')
      );

      // Collect unique groups for the dots
      const groupsPresent = new Set();
      dayEvents.forEach(ev => groupsPresent.add(getGroupClass(ev.group)));

      cells.push(
        <div 
          key={d} 
          className={`day-cell ${isSelected ? 'selected' : ''}`}
          onClick={() => setSelectedDayISO(isoDate === selectedDayISO ? null : isoDate)}
        >
          <span className="day-number">{d}</span>
          
          <div className="badges-container">
            {hasNotes && <span className="day-badge notes">Notes</span>}
            {hasJuntes && <span className="day-badge juntes">Juntes</span>}
          </div>

          <div className="dots-container">
            {Array.from(groupsPresent).map(groupClass => (
              <div key={groupClass} className={`dot ${groupClass}`}></div>
            ))}
          </div>
        </div>
      );
    }
    return cells;
  };

  // Determine what list to show
  const listToShow = useMemo(() => {
    if (selectedDayISO) {
      return processedEvents.eventsByDayISO[selectedDayISO] || [];
    } else {
      // Show all events for the current month being viewed
      return processedEvents.allValidEvents.filter(ev => {
        const evDate = new Date(ev.activeIso);
        return evDate.getMonth() === currentMonth && evDate.getFullYear() === currentYear;
      }).sort((a, b) => a.activeIso.localeCompare(b.activeIso));
    }
  }, [selectedDayISO, currentMonth, currentYear, processedEvents]);

  return (
    <div className="container">
      <h1>🗓️ Calendari Final de Curs 2025-26</h1>
      <p style={{ color: '#64748b' }}>
        Vista en graella mensual. Fes clic a un dia per veure'n el detall.
      </p>

      <div className="filters">
        <button 
          className={`filter-btn ${filters['ESO'] ? 'active eso' : ''}`}
          onClick={() => toggleFilter('ESO')}
        >
          ESO
        </button>
        <button 
          className={`filter-btn ${filters['1 BTX'] ? 'active btx1' : ''}`}
          onClick={() => toggleFilter('1 BTX')}
        >
          1r Batxillerat
        </button>
        <button 
          className={`filter-btn ${filters['2 BTX'] ? 'active btx2' : ''}`}
          onClick={() => toggleFilter('2 BTX')}
        >
          2n Batxillerat
        </button>
        <button 
          className={`filter-btn ${filters['CF'] ? 'active cf' : ''}`}
          onClick={() => toggleFilter('CF')}
        >
          CF
        </button>
        <button 
          className={`filter-btn ${filters['PFI'] ? 'active pfi' : ''}`}
          onClick={() => toggleFilter('PFI')}
        >
          PFI
        </button>
      </div>

      <div className="layout">
        <div className="calendar-container">
          <div className="calendar-header">
            <h2>{monthNames[currentMonth]} {currentYear}</h2>
            <div className="calendar-nav">
              <button onClick={prevMonth}>&lt; Anterior</button>
              <button onClick={nextMonth}>Següent &gt;</button>
            </div>
          </div>
          
          <div className="weekdays">
            <span>Dl</span>
            <span>Dm</span>
            <span>Dx</span>
            <span>Dj</span>
            <span>Dv</span>
            <span>Ds</span>
            <span>Dg</span>
          </div>
          
          <div className="days-grid">
            {generateDays()}
          </div>
        </div>

        <div className="list-container">
          <div className="list-header-row">
            <h3>
              {selectedDayISO 
                ? `Esdeveniments del ${new Date(selectedDayISO).getDate()} de ${monthNames[new Date(selectedDayISO).getMonth()].toLowerCase()}` 
                : `Tots els esdeveniments de ${monthNames[currentMonth].toLowerCase()}`
              }
            </h3>
            {selectedDayISO && (
              <button className="reset-btn" onClick={() => setSelectedDayISO(null)}>
                Veure tot el mes
              </button>
            )}
          </div>
          
          {listToShow.length === 0 ? (
            <p style={{ color: '#94a3b8' }}>No hi ha esdeveniments per a la selecció actual.</p>
          ) : (
            listToShow.map((ev, idx) => {
              const groupClass = getGroupClass(ev.group);
              return (
                <div key={`${ev.id}-${idx}`} className={`event-card ${groupClass}`}>
                  <div className="event-date">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    {/* Show original date string for context, plus the specific iso day we are rendering */}
                    {ev.date} ({new Date(ev.activeIso).getDate()}/{new Date(ev.activeIso).getMonth()+1})
                  </div>
                  <div className="event-desc">{ev.description}</div>
                  <span className={`group-badge ${groupClass}`}>{ev.group}</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default App
