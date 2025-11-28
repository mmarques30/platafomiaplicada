import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PlayCircle, FileText, CheckCircle } from "lucide-react";
import { ClassroomCourse } from "@/hooks/useClassroomCourses";

interface CourseCardProps {
  course: ClassroomCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  const Icon = course.tipo === "video" ? PlayCircle : FileText;

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-colors">
      <CardHeader>
        <div className="aspect-video bg-zinc-800 rounded-lg mb-4 flex items-center justify-center">
          {course.thumbnail_url ? (
            <img
              src={course.thumbnail_url}
              alt={course.titulo}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <Icon className="h-12 w-12 text-zinc-600" />
          )}
        </div>

        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base text-zinc-100">
            {course.titulo}
          </CardTitle>
          {course.completado && (
            <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          )}
        </div>

        {course.gratuito && (
          <Badge variant="outline" className="w-fit">
            Gratuito
          </Badge>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {course.descricao && (
          <p className="text-sm text-zinc-400 line-clamp-2">
            {course.descricao}
          </p>
        )}

        {course.progresso !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-zinc-500">
              <span>Progresso</span>
              <span>{course.progresso}%</span>
            </div>
            <Progress value={course.progresso} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
