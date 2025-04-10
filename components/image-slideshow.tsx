"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

// Sample images - replace with actual couple photos
const images = [
  "https://files.maravianwebservices.com/paul_photos/proposal/IMG_9005.jpg",
  "https://files.maravianwebservices.com/paul_photos/proposal/IMG_9008.jpg",
  "https://files.maravianwebservices.com/paul_photos/proposal/UM-102.jpg",
  "https://files.maravianwebservices.com/paul_photos/proposal/UM-235.jpg",
  "https://files.maravianwebservices.com/paul_photos/proposal/UM-239.jpg",
  "https://files.maravianwebservices.com/paul_photos/proposal/UM-356.jpg",
  "https://files.maravianwebservices.com/paul_photos/proposal/UM-126.jpg",
];

export function ImageSlideshow() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);

      // After fade out animation completes, change the image
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        setIsTransitioning(false);
      }, 1500); // Match this with the fadeOut animation duration
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full -z-10 bg-black">
      <div
        className={`absolute inset-0 w-full h-full ${
          isTransitioning ? "animate-fadeOut" : "animate-fadeIn"
        }`}
      >
        <Image
          src={images[currentImageIndex] || "/placeholder.svg"}
          alt={`Layla and Kondwani ${currentImageIndex + 1}`}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
    </div>
  );
}
