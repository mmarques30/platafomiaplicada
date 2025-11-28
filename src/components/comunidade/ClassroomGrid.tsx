import { useClassroomCourses } from "@/hooks/useClassroomCourses";
import { CourseCard } from "./CourseCard";
import { Skeleton } from "@/components/ui/skeleton";

export function ClassroomGrid() {
  const { courses, isLoading } = useClassroomCourses();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        Conteúdo gratuito disponível para todos os membros
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            Nenhum curso disponível no momento
          </div>
        ) : (
          courses.map((course) => <CourseCard key={course.id} course={course} />)
        )}
      </div>
    </div>
  );
}
