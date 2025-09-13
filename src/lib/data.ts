export interface PerformanceData {
  StudentId: string;
  StudentName: string;
  ExamId: number;
  TestNo: number;
  TestDate: string; // YYYY-MM-DD
  area: string;
  centre: string;
  TotalNoOfCorrects: number;
  TotalNoOfWrongs: number;
  TotalNoOfSkipped: number;
  Total_Score: number;
  TotalQuestions: number;
  TimeTaken: number; // in minutes
}

const studentIds = ['HYTB4V007', 'HYTB4V008', 'HYTB4V009', 'HYTB4V0101002', 'HYTB4V011', 'HYTB4V012', 'HYTB4V013', 'HYTB4V014', 'HYTB4V015', 'HYTB4V016', 'HYTB4V017', 'HYTB4V018', 'HYTB4V019', 'HYTB4V020'];
const studentNames = ['Aria Sharma', 'Leo Chen', 'Zoe Kim', 'Kai Patel', 'Nia Garcia', 'Ethan Wong', 'Maya Singh', 'Liam Rodriguez', 'Chloe Nguyen', 'Owen Miller', 'Sophia Johnson', 'James Brown', 'Olivia Davis', 'William Wilson', 'Ava Moore', 'Mason Taylor', 'Isabella Anderson', 'Elijah Thomas', 'Mia Jackson', 'Benjamin White'];
const areas = ['North', 'South', 'East', 'West'];
const centres = ['Starlight Academy', 'Phoenix Institute', 'Quantum Leap', 'Nexus Learning', 'Horizon Prep', 'Victory Coaching'];

const studentDetails: {StudentId: string, StudentName: string, area: string, centre: string}[] = studentNames.map((name, i) => ({
    StudentId: studentIds[i],
    StudentName: name,
    area: areas[i % areas.length],
    centre: centres[i % centres.length],
}));

const generatedTests: {ExamId: number, TestNo: number, TestDate: string}[] = [];
const numTests = 20;
for (let i = 1; i <= numTests; i++) {
    const date = new Date(2023, 8 + Math.floor(i/5), (i * 3) % 28 + 1);
    generatedTests.push({
        ExamId: 200 + i,
        TestNo: i,
        TestDate: date.toISOString().split('T')[0]
    });
}

const data: Omit<PerformanceData, 'StudentName' | 'area' | 'centre'>[] = [];

for (const test of generatedTests) {
    const numParticipants = Math.floor(Math.random() * 11) + 5; // 5 to 15 participants
    const shuffledStudents = [...studentDetails].sort(() => 0.5 - Math.random());
    const participants = shuffledStudents.slice(0, numParticipants);

    for (const student of participants) {
        const totalQuestions = 50;
        const correct = Math.floor(Math.random() * (totalQuestions - 10)) + 10;
        const wrong = Math.floor(Math.random() * (totalQuestions - correct));
        const skipped = totalQuestions - correct - wrong;
        const score = correct * 4 - wrong;

        data.push({
            StudentId: student.StudentId,
            ExamId: test.ExamId,
            TestNo: test.TestNo,
            TestDate: test.TestDate,
            TotalNoOfCorrects: correct,
            TotalNoOfWrongs: wrong,
            TotalNoOfSkipped: skipped,
            Total_Score: score,
            TotalQuestions: totalQuestions,
            TimeTaken: Math.floor(Math.random() * 20) + 40,
        });
    }
}


export const performanceData: PerformanceData[] = data.map(d => {
    const studentDetail = studentDetails.find(s => s.StudentId === d.StudentId)!;
    return {
        ...d,
        StudentName: studentDetail.StudentName,
        area: studentDetail.area,
        centre: studentDetail.centre
    }
});


export const students = studentDetails;

export const tests = generatedTests.sort((a,b) => b.ExamId - a.ExamId);
