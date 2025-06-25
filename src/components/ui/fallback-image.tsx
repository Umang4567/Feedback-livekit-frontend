import { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface FallbackImageProps extends Omit<ImageProps, "src"> {
  src: string | null | undefined;
  fallbackSrc?: string;
  className?: string;
}

export function FallbackImage({
  src,
  fallbackSrc = "/images/placeholder.svg",
  alt,
  className,
  ...rest
}: FallbackImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(
    src || fallbackSrc
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleError = () => {
    if (imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc);
      setError(true);
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-muted/40 animate-pulse rounded-md z-0"></div>
      )}
      <Image
        {...rest}
        src={imgSrc}
        alt={alt}
        onError={handleError}
        onLoad={handleLoad}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          error ? "grayscale" : "",
          className
        )}
      />
    </div>
  );
} 