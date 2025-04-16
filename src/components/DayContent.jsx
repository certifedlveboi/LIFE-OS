
import React from "react";
import { format } from "date-fns";
import { Cloud, Sun, CloudRain } from "lucide-react";
import { motion } from "framer-motion";

const DayContent = ({ date, notes, reminders }) => {
  const getWeatherIcon = () => {
    // Simulated weather - in real app, this would come from a weather API
    const weatherTypes = [
      { icon: Sun, temp: "75°F", desc: "Sunny" },
      { icon: Cloud, temp: "68°F", desc: "Cloudy" },
      { icon: CloudRain, temp: "62°F", desc: "Rainy" }
    ];
    const randomWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    const WeatherIcon = randomWeather.icon;
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <WeatherIcon className="h-4 w-4" />
        <span>{randomWeather.temp}</span>
        <span>{randomWeather.desc}</span>
      </div>
    );
  };

  const completedTasks = (notes || []).filter(note => note.completed).length;
  const totalTasks = (notes || []).length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-900">{format(date, "MMMM d, yyyy")}</h3>
        {getWeatherIcon()}
      </div>

      {totalTasks > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Task Progress</span>
            <span>{completedTasks}/{totalTasks} completed</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-green-500"
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      <div className="space-y-3">
        {notes?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Tasks</h4>
            <ul className="space-y-1">
              {notes.map((note, index) => (
                <li key={index} className={`text-sm ${note.completed ? "line-through text-gray-400" : "text-gray-600"}`}>
                  {note.text}
                </li>
              ))}
            </ul>
          </div>
        )}

        {reminders?.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Reminders</h4>
            <ul className="space-y-1">
              {reminders.map((reminder, index) => (
                <li
                  key={index}
                  className={`text-sm flex items-center gap-2 ${
                    reminder.completed ? "line-through text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      reminder.category === "work"
                        ? "bg-blue-500"
                        : reminder.category === "personal"
                        ? "bg-purple-500"
                        : "bg-green-500"
                    }`}
                  />
                  <span>{reminder.time}</span>
                  <span>{reminder.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default DayContent;
