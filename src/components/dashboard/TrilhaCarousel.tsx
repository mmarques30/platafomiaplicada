import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { VideoCardVertical } from "@/components/shared/VideoCardVertical";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface Video {
  id: string;
  titulo: string;
  youtube_id: string;
  thumbnail_customizado_url?: string;
  trilha_id?: string;
}

interface TrilhaCarouselProps {
  trilhaId: string;
  trilhaTitulo: string;
  videos: Video[];
}

export function TrilhaCarousel({ trilhaId, trilhaTitulo, videos }: TrilhaCarouselProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold">{trilhaTitulo}</h3>
          <Badge variant="secondary" className="text-xs">
            {videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}
          </Badge>
        </div>
        
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/trilhas/${trilhaId}?video=${videos[0]?.id}`}>
            Ver trilha completa <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      {/* Carrossel */}
      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {videos.map((video) => (
            <CarouselItem 
              key={video.id}
              className="pl-2 md:pl-4 basis-2/5 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <VideoCardVertical {...video} trilha_id={trilhaId} />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {videos.length > 1 && (
          <>
            <CarouselPrevious className="left-0 -translate-x-1/2 bg-background/95 backdrop-blur-sm shadow-lg border-2 hover:bg-primary hover:text-primary-foreground transition-all" />
            <CarouselNext className="right-0 translate-x-1/2 bg-background/95 backdrop-blur-sm shadow-lg border-2 hover:bg-primary hover:text-primary-foreground transition-all" />
          </>
        )}
      </Carousel>
    </div>
  );
}
