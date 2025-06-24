import { useState } from 'react';
import dayjs from 'dayjs';
import { useEffect } from 'react';

// Static color map
const colorMap = {
  blue: "bg-blue-100 border-l-4 border-blue-500",
  purple: "bg-purple-100 border-l-4 border-purple-500",
  green: "bg-green-100 border-l-4 border-green-500",
  red: "bg-red-100 border-l-4 border-red-500"
};

const initialEvents = [
  {
    id: 1,
    title: "Team Meeting",
    date: dayjs().format('YYYY-MM-DD'),
    color: colorMap.blue,
    time: "10:00 AM"
  },
  {
    id: 2,
    title: "Survey Deadline",
    date: dayjs().add(2, 'day').format('YYYY-MM-DD'),
    color: colorMap.purple,
    time: "3:00 PM"
  }
];

export default function Calendar() {
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEventForm, setShowEventForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: dayjs().format('YYYY-MM-DD'),
    time: '10:00',
    color: colorMap.blue
  });

  const [sampleEvents, setSampleEvents] = useState(() => {
    const stored = localStorage.getItem("calendarEvents");
    return stored ? JSON.parse(stored) : initialEvents;
  });

  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(sampleEvents));
  }, [sampleEvents]);

  const generateDays = () => {
    const startOfMonth = currentMonth.startOf('month');
    const days = [];
    let day = startOfMonth.startOf('week');

    for (let i = 0; i < 42; i++) {
      days.push(day);
      day = day.add(1, 'day');
    }
    return days;
  };

  const formatTime = (time24) => {
    return dayjs().hour(parseInt(time24.split(':')[0])).minute(parseInt(time24.split(':')[1])).format("h:mm A");
  };

  const EventModal = () => selectedEvent && (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`} onClick={() => setIsModalOpen(false)}>
      <div className="bg-white p-6 rounded-lg max-w-sm w-full" onClick={e => e.stopPropagation()}>
        {isEditing ? (
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Edit Event</h3>
            <input
              type="text"
              value={selectedEvent.title}
              onChange={(e) => setSelectedEvent({ ...selectedEvent, title: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="date"
              value={selectedEvent.date}
              onChange={(e) => setSelectedEvent({ ...selectedEvent, date: e.target.value })}
              className="w-full p-2 border rounded"
            />
            <input
              type="time"
              value={selectedEvent.time24 || ''}
              onChange={(e) => {
                const formatted = formatTime(e.target.value);
                setSelectedEvent({ ...selectedEvent, time: formatted, time24: e.target.value });
              }}
              className="w-full p-2 border rounded"
            />
            <div className="flex space-x-2">
              {Object.keys(colorMap).map(color => (
                <div
                  key={color}
                  className={`w-6 h-6 rounded-full ${colorMap[color].split(" ")[0]} cursor-pointer ${selectedEvent.color === colorMap[color] ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  onClick={() => setSelectedEvent({ ...selectedEvent, color: colorMap[color] })}
                />
              ))}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  setSampleEvents(sampleEvents.map(e =>
                    e.id === selectedEvent.id ? selectedEvent : e
                  ));
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-bold">{selectedEvent.title}</h3>
              <div className="space-x-2">
                <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:text-blue-700">Edit</button>
                <button onClick={() => {
                  setSampleEvents(sampleEvents.filter(e => e.id !== selectedEvent.id));
                  setIsModalOpen(false);
                }} className="text-red-500 hover:text-red-700">Delete</button>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p><span className="font-semibold">Date:</span> {dayjs(selectedEvent.date).format('dddd, MMMM D, YYYY')}</p>
              <p><span className="font-semibold">Time:</span> {selectedEvent.time}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const EventForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        <h3 className="text-lg font-bold mb-4">Add New Event</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Event title"
            className="w-full p-2 border rounded"
            value={newEvent.title}
            onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
          />
          <input
            type="date"
            className="w-full p-2 border rounded"
            value={newEvent.date}
            onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
          />
          <input
            type="time"
            className="w-full p-2 border rounded"
            value={newEvent.time}
            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
          />
          <div className="flex space-x-2">
            {Object.keys(colorMap).map(color => (
              <div
                key={color}
                className={`w-6 h-6 rounded-full ${colorMap[color].split(" ")[0]} cursor-pointer ${newEvent.color === colorMap[color] ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
                onClick={() => setNewEvent({ ...newEvent, color: colorMap[color] })}
              />
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <button onClick={() => setShowEventForm(false)} className="px-4 py-2 text-gray-600">Cancel</button>
            <button onClick={() => {
              const formattedTime = formatTime(newEvent.time);
              const newEventObj = {
                ...newEvent,
                id: Date.now(),
                time: formattedTime
              };
              setSampleEvents([...sampleEvents, newEventObj]);
              setShowEventForm(false);
              setNewEvent({
                title: '',
                date: dayjs().format('YYYY-MM-DD'),
                time: '10:00',
                color: colorMap.blue
              });
            }} className="px-4 py-2 bg-blue-500 text-white rounded">Save</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex w-full min-h-screen">
    {/* Sidebar */}
    <div className="w-1/4 bg-gray-900 text-gray-100 border-r border-gray-700 flex flex-col items-center justify-start p-4">
      <div className="text-white font-bold text-xl mb-8">SurveySparrow</div>
      {/* (Optional) Sidebar content */}
    </div>

      {/* Main Calendar */}
      <div className="w-3/4 p-4">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">←</button>
          <h2 className="text-xl font-bold">{currentMonth.format('MMMM YYYY')}</h2>
          <button onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">→</button>
        </div>

        <button onClick={() => setShowEventForm(true)} className="w-full mb-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">+ Create Event</button>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-medium p-2 bg-gray-100 rounded-t">{day}</div>
          ))}

          {generateDays().map((day, index) => {
            const isCurrentMonth = day.month() === currentMonth.month();
            const isToday = day.isSame(dayjs(), 'day');
            const dayKey = day.format('YYYY-MM-DD');
            const dayEvents = sampleEvents.filter(e => e.date === dayKey);

            return (
              <div key={index} className={`min-h-[100px] border p-1 ${isCurrentMonth ? 'bg-white' : 'bg-gray-50 text-gray-400'} ${isToday ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="text-right">{day.format('D')}</div>
                <div className="mt-1 space-y-1 max-h-[80px] overflow-y-auto">
                  {dayEvents.slice(0, 2).map(event => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsModalOpen(true);
                        setIsEditing(false);
                      }}
                      className={`text-xs p-1 rounded ${event.color} truncate cursor-pointer hover:opacity-80`}
                    >
                      <span className="font-medium">{event.time}</span> {event.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-blue-500 pl-1 cursor-pointer hover:underline" onClick={() => {
                      setSelectedEvent(dayEvents[2]);
                      setIsModalOpen(true);
                    }}>
                      +{dayEvents.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isModalOpen && <EventModal />}
        {showEventForm && <EventForm />}
      </div>
    </div>
  );
}
