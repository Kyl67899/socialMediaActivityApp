"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue } from "framer-motion"
import { Settings, Heart, MessageCircle, Clock, RefreshCw, ChevronDown, Check } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface ActivityItem {
  id: string
  user: {
    name: string
    avatar: string
    initials: string
  }
  action: "liked" | "commented"
  target: string
  timestamp: string
  image: string
  isNew?: boolean
}

const initialActivityData: ActivityItem[] = [
  {
    id: "1",
    user: { name: "Theo James", avatar: "/placeholder.svg?height=40&width=40", initials: "TJ" },
    action: "liked",
    target: "your photo",
    timestamp: "2 hours ago",
    image: "/placeholder.svg?height=60&width=60",
    isNew: true,
  },
  {
    id: "2",
    user: { name: "Roger Matthias", avatar: "/placeholder.svg?height=40&width=40", initials: "RM" },
    action: "liked",
    target: "your photo",
    timestamp: "3 hours ago",
    image: "/placeholder.svg?height=60&width=60",
    isNew: true,
  },
  {
    id: "3",
    user: { name: "Roger Matthias", avatar: "/placeholder.svg?height=40&width=40", initials: "RM" },
    action: "commented",
    target: "your photo",
    timestamp: "5 hours ago",
    image: "/placeholder.svg?height=60&width=60",
    isNew: true,
  },
  {
    id: "4",
    user: { name: "Roger Philips", avatar: "/placeholder.svg?height=40&width=40", initials: "RP" },
    action: "liked",
    target: "your photo",
    timestamp: "1 day ago",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "5",
    user: { name: "Lilly Reynolds", avatar: "/placeholder.svg?height=40&width=40", initials: "LR" },
    action: "commented",
    target: "your photo",
    timestamp: "3 days ago",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "6",
    user: { name: "Brian Spilner", avatar: "/placeholder.svg?height=40&width=40", initials: "BS" },
    action: "liked",
    target: "your photo",
    timestamp: "4 days ago",
    image: "/placeholder.svg?height=60&width=60",
  },
  {
    id: "7",
    user: { name: "Brian Spilner", avatar: "/placeholder.svg?height=40&width=40", initials: "BS" },
    action: "commented",
    target: "your photo",
    timestamp: "5 days ago",
    image: "/placeholder.svg?height=60&width=60",
  },
]

const newActivityItems: ActivityItem[] = [
  {
    id: "new-1",
    user: { name: "Emma Watson", avatar: "/placeholder.svg?height=40&width=40", initials: "EW" },
    action: "liked",
    target: "your story",
    timestamp: "Just now",
    image: "/placeholder.svg?height=60&width=60",
    isNew: true,
  },
  {
    id: "new-2",
    user: { name: "Chris Evans", avatar: "/placeholder.svg?height=40&width=40", initials: "CE" },
    action: "commented",
    target: "your post",
    timestamp: "1 minute ago",
    image: "/placeholder.svg?height=60&width=60",
    isNew: true,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
}

export default function ActivityApp() {
  const [mounted, setMounted] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "likes" | "comments">("all")
  const [activityData, setActivityData] = useState(initialActivityData)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isPulling, setIsPulling] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const currentY = useRef(0)
  const pullDistance = useMotionValue(0)

  const todayActivities = activityData.slice(0, 3)
  const thisWeekActivities = activityData.slice(3)
  const newNotificationsCount = activityData.filter((item) => item.isNew).length

  useEffect(() => {
    setMounted(true)
  }, [])

  const markAsRead = useCallback((activityId: string) => {
    setActivityData((prev) => prev.map((item) => (item.id === activityId ? { ...item, isNew: false } : item)))
  }, [])

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      startY.current = e.touches[0].clientY
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || !containerRef.current) return

      currentY.current = e.touches[0].clientY
      const deltaY = currentY.current - startY.current

      if (deltaY > 0 && containerRef.current.scrollTop === 0) {
        e.preventDefault()
        const distance = Math.min(deltaY * 0.5, 100)
        pullDistance.set(distance)
      }
    },
    [isPulling, pullDistance],
  )

  const handleTouchEnd = useCallback(() => {
    if (!isPulling) return

    const distance = pullDistance.get()
    setIsPulling(false)

    if (distance > 60) {
      // Trigger refresh
      setIsRefreshing(true)
      pullDistance.set(80)

      // Simulate API call
      setTimeout(() => {
        setActivityData((prev) => [...newActivityItems, ...prev])
        setIsRefreshing(false)
        pullDistance.set(0)
      }, 1500)
    } else {
      // Snap back
      pullDistance.set(0)
    }
  }, [isPulling, pullDistance])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("touchstart", handleTouchStart, { passive: false })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  const getFilteredActivities = (activities: ActivityItem[]) => {
    if (selectedFilter === "all") return activities
    return activities.filter((item) =>
      selectedFilter === "likes" ? item.action === "liked" : item.action === "commented",
    )
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <motion.div
        ref={containerRef}
        className="max-w-md mx-auto bg-white/80 backdrop-blur-sm min-h-screen shadow-2xl overflow-auto relative"
        style={{ y: pullDistance }}
      >
        {/* Pull to Refresh Indicator */}
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 bg-gradient-to-b from-white/90 to-transparent backdrop-blur-sm z-10"
          style={{
            y: pullDistance,
          }}
        >
          <div className="flex items-center gap-2 text-gray-600">
            {isRefreshing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                </motion.div>
                <span className="text-sm font-medium">Refreshing...</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">
                  {pullDistance.get() > 60 ? "Release to refresh" : "Pull to refresh"}
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Header */}
        <motion.div
          className="flex items-center justify-between p-6 border-b border-gray-100 relative z-20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Activity</h1>
            <motion.div
              className="flex items-center gap-2 mt-1"
              initial={{ scale: 1 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            >
              <span className="text-sm text-gray-600">You have</span>
              <Badge variant="destructive" className="text-xs font-semibold">
                {newNotificationsCount} Notifications
              </Badge>
              <span className="text-sm text-gray-600">today.</span>
            </motion.div>
          </div>
          <motion.div whileHover={{ rotate: 180 }} whileTap={{ scale: 0.9 }} transition={{ duration: 0.3 }}>
            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
              <Settings className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          className="flex gap-2 p-4 border-b border-gray-100 relative z-20"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {(["all", "likes", "comments"] as const).map((filter) => (
            <motion.button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedFilter === filter
                  ? "bg-red-500 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </motion.button>
          ))}
        </motion.div>

        {/* Swipe Instructions */}
        {newNotificationsCount > 0 && (
          <motion.div
            className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-center gap-2">
              <motion.div animate={{ x: [0, 8, 0] }} transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}>
                👆
              </motion.div>
              <p className="text-sm text-blue-700 font-medium text-center">
                Swipe right on blue notifications to mark as read
              </p>
            </div>
          </motion.div>
        )}

        {/* Activity Feed */}
        <div className="p-6 space-y-8 relative z-20">
          {/* Today Section */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.h2 className="text-lg font-semibold text-gray-900 mb-4" variants={itemVariants}>
              Today
            </motion.h2>
            <div className="space-y-4">
              <AnimatePresence>
                {getFilteredActivities(todayActivities).map((activity, index) => (
                  <ActivityCard key={activity.id} activity={activity} index={index} onMarkAsRead={markAsRead} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* This Week Section */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.h2 className="text-lg font-semibold text-gray-900 mb-4" variants={itemVariants}>
              This Week
            </motion.h2>
            <div className="space-y-4">
              <AnimatePresence>
                {getFilteredActivities(thisWeekActivities).map((activity, index) => (
                  <ActivityCard key={activity.id} activity={activity} index={index + 3} onMarkAsRead={markAsRead} />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

function ActivityCard({
  activity,
  index,
  onMarkAsRead,
}: {
  activity: ActivityItem
  index: number
  onMarkAsRead: (id: string) => void
}) {
  const [swipeX, setSwipeX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const startX = useRef(0)
  const startY = useRef(0)

  const handleStart = useCallback(
    (clientX: number, clientY: number) => {
      if (!activity.isNew) return

      startX.current = clientX
      startY.current = clientY
      setIsDragging(true)
    },
    [activity.isNew],
  )

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDragging || !activity.isNew) return

      const deltaX = clientX - startX.current
      const deltaY = clientY - startY.current

      // Only allow horizontal swipe if movement is more horizontal than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > 0) {
        const newSwipeX = Math.min(deltaX, 120)
        setSwipeX(newSwipeX)
      }
    },
    [isDragging, activity.isNew],
  )

  const handleEnd = useCallback(() => {
    if (!isDragging || !activity.isNew) return

    setIsDragging(false)

    if (swipeX > 60) {
      // Mark as read
      setSwipeX(120)
      setTimeout(() => {
        onMarkAsRead(activity.id)
        setSwipeX(0)
      }, 200)
    } else {
      // Snap back
      setSwipeX(0)
    }
  }, [isDragging, activity.isNew, swipeX, activity.id, onMarkAsRead])

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      handleStart(e.touches[0].clientX, e.touches[0].clientY)
    },
    [handleStart],
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    },
    [handleMove],
  )

  const handleTouchEnd = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Mouse events for desktop testing
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      handleStart(e.clientX, e.clientY)
    },
    [handleStart],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    },
    [handleMove],
  )

  const handleMouseUp = useCallback(() => {
    handleEnd()
  }, [handleEnd])

  // Global mouse events
  useEffect(() => {
    if (!isDragging) return

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY)
    }

    const handleGlobalMouseUp = () => {
      handleEnd()
    }

    document.addEventListener("mousemove", handleGlobalMouseMove)
    document.addEventListener("mouseup", handleGlobalMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove)
      document.removeEventListener("mouseup", handleGlobalMouseUp)
    }
  }, [isDragging, handleMove, handleEnd])

  // Double-click as alternative for desktop
  const handleDoubleClick = useCallback(() => {
    if (activity.isNew) {
      onMarkAsRead(activity.id)
    }
  }, [activity.isNew, activity.id, onMarkAsRead])

  return (
    <motion.div
      className="relative overflow-hidden rounded-xl"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ delay: index * 0.1 }}
      layout
    >
      {/* Swipe Background */}
      {activity.isNew && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-end pr-6 rounded-xl"
          style={{
            opacity: swipeX / 120,
            transform: `translateX(${Math.max(0, swipeX - 120)}px)`,
          }}
        >
          <div className="flex items-center gap-2 text-white">
            <Check className="w-5 h-5" />
            <span className="font-medium text-sm">Mark as read</span>
          </div>
        </div>
      )}

      {/* Activity Card */}
      <div
        className={`flex items-center gap-4 p-3 rounded-xl transition-all cursor-pointer group relative z-10 select-none ${activity.isNew ? "bg-blue-50/90 hover:bg-blue-100/90 border border-blue-200/50" : "bg-white hover:bg-gray-50"
          }`}
        style={{
          transform: `translateX(${swipeX}px)`,
          transition: isDragging ? "none" : "transform 0.3s ease-out",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      >
        {/* Red dot indicator */}
        <motion.div
          className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.isNew ? "bg-red-500" : "bg-transparent"}`}
          animate={activity.isNew ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
        />

        {/* User Avatar */}
        <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
          <Avatar className="w-12 h-12 border-2 border-white shadow-md">
            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-400 text-white font-semibold">
              {activity.user.initials}
            </AvatarFallback>
          </Avatar>
        </motion.div>

        {/* Activity Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="font-semibold text-red-500 text-sm">{activity.user.name}</span>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + index * 0.1 }}>
              {activity.action === "liked" ? (
                <Heart className="w-4 h-4 text-red-500 fill-current" />
              ) : (
                <MessageCircle className="w-4 h-4 text-blue-500" />
              )}
            </motion.div>
            <span className="text-sm text-gray-700">
              {activity.action} {activity.target}
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{activity.timestamp}</span>
          </div>
        </div>

        {/* Photo Thumbnail */}
        <motion.div
          className="relative w-14 h-14 rounded-lg overflow-hidden shadow-md flex-shrink-0"
          whileHover={{ scale: 1.1, rotate: 2 }}
          transition={{ duration: 0.3 }}
        >
          <Image
            src={activity.image || "/placeholder.svg"}
            alt="Activity photo"
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </motion.div>

        {/* Swipe Indicator */}
        {activity.isNew && !isDragging && (
          <motion.div
            className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-500"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </motion.div>
        )}

        {/* Desktop hint */}
        {activity.isNew && (
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Swipe right or double-click
          </div>
        )}
      </div>
    </motion.div>
  )
}
