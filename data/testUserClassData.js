const TEST_USER_EMAIL = 'testuser1@gmail.com';

const BASE_CLASSES = [
  {
    id: 'ls-demo-class-1',
    title: 'Riverstone Luminaries',
    curriculumLesson: { grade: 1, lessonNumber: 4 },
    imageUrl: null,
    facilitators: [
      { id: 'ls-demo-teacher-1', firstName: 'Layla', lastName: 'Santiago' },
      { id: 'ls-demo-teacher-2', firstName: 'Noah', lastName: 'Kim' },
    ],
    participants: [
      { id: 'ls-demo-student-1', firstName: 'Avery', lastName: 'Stone' },
      { id: 'ls-demo-student-2', firstName: 'Jordan', lastName: 'Nguyen' },
      { id: 'ls-demo-student-3', firstName: 'Priya', lastName: 'Kapoor' },
      { id: 'ls-demo-student-4', firstName: 'Mateo', lastName: 'Lopez' },
    ],
  },
  {
    id: 'ls-demo-class-2',
    title: 'Harmony Garden Guides',
    curriculumLesson: { grade: 2, lessonNumber: 3 },
    imageUrl: null,
    facilitators: [
      { id: 'ls-demo-teacher-3', firstName: 'Imani', lastName: 'Rahman' },
      { id: 'ls-demo-teacher-4', firstName: 'Theo', lastName: 'Martinez' },
    ],
    participants: [
      { id: 'ls-demo-student-5', firstName: 'Micah', lastName: 'Rivera' },
      { id: 'ls-demo-student-6', firstName: 'Sasha', lastName: 'Kowalski' },
      { id: 'ls-demo-student-7', firstName: 'Leila', lastName: 'Ahmed' },
      { id: 'ls-demo-student-8', firstName: 'Ethan', lastName: 'Wright' },
    ],
  },
];

const BASE_CHILDREN = [
  {
    _id: 'ls-demo-child-1',
    firstName: 'Avery',
    lastName: 'Stone',
    grade: 1,
    classes: [BASE_CLASSES[0]],
  },
  {
    _id: 'ls-demo-child-2',
    firstName: 'Micah',
    lastName: 'Rivera',
    grade: 2,
    classes: [BASE_CLASSES[1]],
  },
];

const clonePersonList = (people = []) => people.map(person => ({ ...person }));

const cloneClass = cls => ({
  ...cls,
  facilitators: clonePersonList(cls.facilitators),
  participants: clonePersonList(cls.participants),
});

const cloneChild = child => {
  const classes = (child.classes || []).map(cloneClass);
  return {
    ...child,
    classes,
    class: classes,
  };
};

const getTestUserClassData = () => {
  const classes = BASE_CLASSES.map(cloneClass);
  const children = BASE_CHILDREN.map(cloneChild);
  return { classes, children };
};

export { TEST_USER_EMAIL, getTestUserClassData };
