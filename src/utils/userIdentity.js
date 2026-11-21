const STUDENT_DEMO_EMAIL = 'student@placify.com';

export const getUserDisplayIdentity = (user) => {
  const isStudentDemo = user?.email?.toLowerCase() === STUDENT_DEMO_EMAIL;

  return {
    name: isStudentDemo ? 'Shashank Srivastava' : user?.name,
    targetCompany: isStudentDemo ? 'MNC / Company Prep' : user?.targetCompany,
  };
};
