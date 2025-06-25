"use client"

import { useState, useEffect, useRef } from "react"

// Simple utility functions
const formatDate = (date, format) => {
  const d = new Date(date)
  if (format === "YYYY-MM-DD") {
    return d.toISOString().split("T")[0]
  }
  if (format === "MMMM YYYY") {
    return d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }
  if (format === "MMM D") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }
  if (format === "full") {
    return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
  }
  return d.toLocaleDateString()
}

const addMonths = (date, months) => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

const startOfMonth = (date) => {
  const d = new Date(date)
  d.setDate(1)
  return d
}

const startOfWeek = (date) => {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  return d
}

const addDays = (date, days) => {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

const isSameDay = (date1, date2) => {
  return new Date(date1).toDateString() === new Date(date2).toDateString()
}

const formatTime = (time24) => {
  const [hours, minutes] = time24.split(":")
  const date = new Date()
  date.setHours(Number.parseInt(hours), Number.parseInt(minutes))
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
}

// Event colors - simple and clean
const eventColors = {
  blue: "bg-blue-100 border-l-4 border-blue-500 text-blue-800",
  green: "bg-green-100 border-l-4 border-green-500 text-green-800",
  purple: "bg-purple-100 border-l-4 border-purple-500 text-purple-800",
  red: "bg-red-100 border-l-4 border-red-500 text-red-800",
  orange: "bg-orange-100 border-l-4 border-orange-500 text-orange-800",
}

const colorDots = {
  blue: "bg-blue-500",
  green: "bg-green-500",
  purple: "bg-purple-500",
  red: "bg-red-500",
  orange: "bg-orange-500",
}

const initialEvents = [
  {
    id: 1,
    title: "Team Meeting",
    date: formatDate(new Date(), "YYYY-MM-DD"),
    color: "blue",
    time: "10:00 AM",
    time24: "10:00",
  },
  {
    id: 2,
    title: "Project Review",
    date: formatDate(addDays(new Date(), 1), "YYYY-MM-DD"),
    color: "green",
    time: "2:00 PM",
    time24: "14:00",
  },
]

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [events, setEvents] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("calendarEvents")
      return stored ? JSON.parse(stored) : initialEvents
    }
    return initialEvents
  })

  const [newEvent, setNewEvent] = useState({
    title: "",
    date: formatDate(new Date(), "YYYY-MM-DD"),
    time24: "10:00",
    color: "blue",
  })

  const titleInputRef = useRef(null)
  const editTitleInputRef = useRef(null)

  // Save events to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("calendarEvents", JSON.stringify(events))
    }
  }, [events])

  // Auto-focus inputs when modals open
  useEffect(() => {
    if (showEventForm && titleInputRef.current) {
      setTimeout(() => titleInputRef.current.focus(), 100)
    }
  }, [showEventForm])

  useEffect(() => {
    if (isEditing && editTitleInputRef.current) {
      setTimeout(() => editTitleInputRef.current.focus(), 100)
    }
  }, [isEditing])

  const generateDays = () => {
    const start = startOfWeek(startOfMonth(currentMonth))
    const days = []
    for (let i = 0; i < 42; i++) {
      days.push(addDays(start, i))
    }
    return days
  }

  const resetForm = () => {
    setNewEvent({
      title: "",
      date: formatDate(new Date(), "YYYY-MM-DD"),
      time24: "10:00",
      color: "blue",
    })
  }

  const handleCreateEvent = () => {
    if (!newEvent.title.trim()) return

    const event = {
      ...newEvent,
      id: Date.now(),
      time: formatTime(newEvent.time24),
    }
    setEvents([...events, event])
    setShowEventForm(false)
    resetForm()
  }

  const handleUpdateEvent = () => {
    if (!selectedEvent.title.trim()) return

    const updatedEvent = {
      ...selectedEvent,
      time: formatTime(selectedEvent.time24),
    }
    setEvents(events.map((e) => (e.id === selectedEvent.id ? updatedEvent : e)))
    setIsEditing(false)
  }

  const handleDeleteEvent = () => {
    setEvents(events.filter((e) => e.id !== selectedEvent.id))
    setShowModal(false)
    setSelectedEvent(null)
  }

  const openEventModal = (event) => {
    setSelectedEvent(event)
    setShowModal(true)
    setIsEditing(false)
  }

  const closeModal = () => {
    setShowModal(false)
    setSelectedEvent(null)
    setIsEditing(false)
  }

  const closeEventForm = () => {
    setShowEventForm(false)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600 mt-1">{formatDate(currentMonth, "MMMM YYYY")}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
                className="p-2 hover:bg-gray-100 rounded-lg border"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-gray-100 rounded-lg border"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => setShowEventForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                + Add Event
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                {events
                  .filter((event) => new Date(event.date) >= new Date().setHours(0, 0, 0, 0))
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      onClick={() => openEventModal(event)}
                      className="p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-3 h-3 rounded-full ${colorDots[event.color]} mt-1`}></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{event.title}</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(event.date, "MMM D")} • {event.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                {events.filter((event) => new Date(event.date) >= new Date().setHours(0, 0, 0, 0)).length === 0 && (
                  <p className="text-gray-500 text-sm">No upcoming events</p>
                )}
              </div>
            </div>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Day headers */}
              <div className="grid grid-cols-7 border-b">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-4 text-center font-semibold text-gray-700 bg-gray-50">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{day.slice(0, 1)}</span>
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7">
                {generateDays().map((day, index) => {
                  const isCurrentMonth = day.getMonth() === currentMonth.getMonth()
                  const isToday = isSameDay(day, new Date())
                  const dayKey = formatDate(day, "YYYY-MM-DD")
                  const dayEvents = events.filter((e) => e.date === dayKey)

                  return (
                    <div
                      key={index}
                      className={`min-h-[100px] p-2 border-b border-r ${isCurrentMonth ? "bg-white" : "bg-gray-50"
                        } ${isToday ? "bg-blue-50" : ""}`}
                    >
                      <div className="mb-2">
                        <span
                          className={`inline-block w-6 h-6 text-sm font-medium text-center rounded-full ${
                            isToday ? "bg-blue-600 text-white" : isCurrentMonth ? "text-gray-900" : "text-gray-400"
                          }`}
                        >
                          {day.getDate()}
                        </span>
                      </div>


                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            onClick={() => openEventModal(event)}
                            className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${eventColors[event.color]}`}
                          >
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-xs opacity-75">{event.time}</div>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-blue-600 cursor-pointer hover:underline">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{isEditing ? "Edit Event" : "Event Details"}</h3>
                <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      ref={editTitleInputRef}
                      type="text"
                      value={selectedEvent.title}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Event title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                      type="date"
                      value={selectedEvent.date}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                      type="time"
                      value={selectedEvent.time24}
                      onChange={(e) => setSelectedEvent({ ...selectedEvent, time24: e.target.value })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex gap-2">
                      {Object.keys(colorDots).map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedEvent({ ...selectedEvent, color })}
                          className={`w-8 h-8 rounded-full ${colorDots[color]} ${selectedEvent.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleUpdateEvent}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">{selectedEvent.title}</h4>
                    <div className="space-y-2 text-gray-600">
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDate(selectedEvent.date, "full")}
                      </p>
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {selectedEvent.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={handleDeleteEvent}
                      className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Add New Event</h3>
                <button onClick={closeEventForm} className="text-gray-400 hover:text-gray-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    ref={titleInputRef}
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Event title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newEvent.time24}
                    onChange={(e) => setNewEvent({ ...newEvent, time24: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <div className="flex gap-2">
                    {Object.keys(colorDots).map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewEvent({ ...newEvent, color })}
                        className={`w-8 h-8 rounded-full ${colorDots[color]} ${newEvent.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                          }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleCreateEvent}
                    disabled={!newEvent.title.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    Create Event
                  </button>
                  <button
                    onClick={closeEventForm}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
