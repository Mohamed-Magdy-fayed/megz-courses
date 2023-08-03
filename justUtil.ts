const f = Array.from({ length: 9 }, (item, i) => ({
  name: `Lesson ${i + 1}`,
  levelId: id,
}));
f.forEach((e) => createLessonMutation.mutate(e));
