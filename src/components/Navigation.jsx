
import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const Navigation = ({ activeSection, onSelectSection }) => {
  const menuItems = [
    { icon: CalendarIcon, label: "Calendar", id: "calendar" },
    { icon: Clock, label: "Focus", id: "focus" },
  ];

  return (
    <div className="bg-white shadow-md py-2 px-6 mb-6 rounded-lg">
      <div className="max-w-6xl mx-auto flex items-center justify-start gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelectSection(item.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                activeSection === item.id
                  ? "bg-blue-100 text-blue-700"
                  : "hover:bg-gray-100"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default Navigation;
