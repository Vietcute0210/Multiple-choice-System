const QUESTION_POOL = [
  { text: 'Mô hình OSI có bao nhiêu tầng?', opts: ['5 tầng', '6 tầng', '7 tầng', '8 tầng'], ans: 2 },
  { text: 'Giao thức TCP hoạt động ở tầng nào trong mô hình OSI?', opts: ['Tầng Network', 'Tầng Transport', 'Tầng Session', 'Tầng Application'], ans: 1 },
  { text: 'Địa chỉ IP lớp C có bao nhiêu bit cho phần host?', opts: ['8 bit', '16 bit', '24 bit', '32 bit'], ans: 0 },
  { text: 'DNS là viết tắt của từ gì?', opts: ['Dynamic Name System', 'Domain Name System', 'Data Network System', 'Domain Network Service'], ans: 1 },
  { text: 'Câu lệnh SQL nào dùng để thêm dữ liệu vào bảng?', opts: ['ADD', 'INSERT', 'CREATE', 'UPDATE'], ans: 1 },
  { text: 'Kiểu dữ liệu nào trong Python không thay đổi được (immutable)?', opts: ['list', 'dict', 'tuple', 'set'], ans: 2 },
  { text: 'Vòng lặp nào sau đây luôn thực hiện ít nhất một lần?', opts: ['for', 'while', 'do-while', 'foreach'], ans: 2 },
  { text: 'Thuật toán sắp xếp nào có độ phức tạp O(n log n) trong trường hợp tốt nhất?', opts: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], ans: 2 },
  { text: 'Stack là cấu trúc dữ liệu theo nguyên tắc nào?', opts: ['FIFO', 'LIFO', 'FILO', 'LILO'], ans: 1 },
  { text: 'Deadlock xảy ra khi nào?', opts: ['CPU quá tải', 'Các tiến trình chờ nhau vô hạn', 'Bộ nhớ đầy', 'Tiến trình bị ngắt'], ans: 1 },
  { text: 'Chỉ số Big-O của tìm kiếm nhị phân là?', opts: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], ans: 2 },
  { text: 'Giao thức nào thuộc tầng Application của TCP/IP?', opts: ['IP', 'TCP', 'HTTP', 'UDP'], ans: 2 },
  { text: 'Khóa ngoại (Foreign Key) dùng để làm gì?', opts: ['Tăng tốc truy vấn', 'Liên kết giữa các bảng', 'Mã hóa dữ liệu', 'Tạo chỉ mục'], ans: 1 },
  { text: 'Hàm len() trong Python trả về gì?', opts: ['Kiểu dữ liệu', 'Địa chỉ bộ nhớ', 'Số phần tử', 'Giá trị lớn nhất'], ans: 2 },
  { text: 'Giao thức ARP có chức năng gì?', opts: ['Phân giải tên miền', 'Gán địa chỉ IP động', 'Ánh xạ IP sang MAC', 'Truyền file'], ans: 2 },
  { text: 'Câu lệnh SELECT * FROM table WHERE không có điều kiện sẽ?', opts: ['Báo lỗi', 'Trả về hàng đầu tiên', 'Trả về tất cả dữ liệu', 'Không thực thi'], ans: 2 },
  { text: 'Trong Python, list comprehension [x**2 for x in range(5)] cho kết quả?', opts: ['[1,4,9,16,25]', '[0,1,4,9,16]', '[0,2,4,6,8]', '[1,2,3,4,5]'], ans: 1 },
  { text: 'Thuật toán Dijkstra dùng để giải quyết bài toán nào?', opts: ['Sắp xếp', 'Tìm đường đi ngắn nhất', 'Tìm kiếm nhị phân', 'Nén dữ liệu'], ans: 1 },
  { text: 'Tiến trình zombie là gì?', opts: ['Tiến trình bị treo', 'Tiến trình đã kết thúc nhưng chưa được dọn dẹp', 'Tiến trình ưu tiên cao', 'Tiến trình hệ thống'], ans: 1 },
  { text: 'IPv4 có bao nhiêu bit?', opts: ['16', '32', '64', '128'], ans: 1 }
];

export function generateQuestions(examId, count) {
  const questions = [];
  for (let i = 0; i < count; i += 1) {
    const base = QUESTION_POOL[(i + examId) % QUESTION_POOL.length];
    questions.push({
      id: i + 1,
      text: `[Câu ${i + 1}] ${base.text}`,
      opts: [...base.opts],
      ans: base.ans,
      explain: `Đây là giải thích cho câu ${i + 1}. Đáp án đúng là "${base.opts[base.ans]}".`
    });
  }
  return questions;
}

export const USERS = [
  { id: 1, username: 'sinhvien', password: '123456', name: 'Nguyễn Văn An', email: 'an.nv@ptit.edu.vn', msv: 'B21DCCN001', class: 'D21CQCN01', role: 'student' },
  { id: 2, username: 'nguyenthib', password: '123456', name: 'Nguyễn Thị Bình', email: 'binh.nt@ptit.edu.vn', msv: 'B21DCCN002', class: 'D21CQCN01', role: 'student' },
  { id: 3, username: 'trancongc', password: '123456', name: 'Trần Công Cường', email: 'cuong.tc@ptit.edu.vn', msv: 'B21DCCN003', class: 'D21CQCN02', role: 'student' },
  { id: 4, username: 'lehongd', password: '123456', name: 'Lê Hồng Đào', email: 'dao.lh@ptit.edu.vn', msv: 'B21DCCN004', class: 'D21CQCN02', role: 'student' },
  { id: 5, username: 'phamminhe', password: '123456', name: 'Phạm Minh Đức', email: 'duc.pm@ptit.edu.vn', msv: 'B21DCCN005', class: 'D21CQCN01', role: 'student' }
];

export const EXAMS = [
  { id: 1, name: 'Mạng máy tính - Luyện tập 1', subject: 'Mạng máy tính', type: 'Luyện tập', status: 'free', duration: 30, total: 20, desc: 'Bài luyện tập cơ bản về các khái niệm mạng máy tính, mô hình OSI, TCP/IP.', questions: generateQuestions(1, 20) },
  { id: 2, name: 'Cơ sở dữ liệu - Giữa kỳ', subject: 'Cơ sở dữ liệu', type: 'Giữa kỳ', status: 'scheduled', duration: 60, total: 30, desc: 'Kiểm tra giữa kỳ môn Cơ sở dữ liệu, bao gồm ER diagram, SQL cơ bản.', scheduleDate: '2026-04-15 08:00', questions: generateQuestions(2, 30) },
  { id: 3, name: 'Lập trình Python - Luyện tập', subject: 'Lập trình Python', type: 'Luyện tập', status: 'free', duration: 45, total: 25, desc: 'Luyện tập về cú pháp Python, kiểu dữ liệu, vòng lặp và hàm.', questions: generateQuestions(3, 25) },
  { id: 4, name: 'Toán rời rạc - Cuối kỳ', subject: 'Toán rời rạc', type: 'Cuối kỳ', status: 'scheduled', duration: 90, total: 40, desc: 'Kiểm tra cuối kỳ về logic toán học, lý thuyết tập hợp, đồ thị.', scheduleDate: '2026-05-20 13:30', questions: generateQuestions(4, 40) },
  { id: 5, name: 'Hệ điều hành - Luyện tập 2', subject: 'Hệ điều hành', type: 'Luyện tập', status: 'free', duration: 30, total: 20, desc: 'Luyện tập về quản lý tiến trình, bộ nhớ, và hệ thống tập tin.', questions: generateQuestions(5, 20) },
  { id: 6, name: 'Thuật toán - Giữa kỳ', subject: 'Cấu trúc dữ liệu & Thuật toán', type: 'Giữa kỳ', status: 'closed', duration: 60, total: 30, desc: 'Kiểm tra về độ phức tạp thuật toán, tìm kiếm, sắp xếp.', questions: generateQuestions(6, 30) }
];

export const RESULTS_DATA = [
  { id: 1, userId: 1, examId: 1, score: 8.5, correct: 17, total: 20, timeUsed: 22, date: '2026-02-10', answers: [2, 1, 0, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 2, 2, 2, 1, 1, 1, 1] },
  { id: 2, userId: 1, examId: 3, score: 7.2, correct: 18, total: 25, timeUsed: 38, date: '2026-02-18', answers: [2, 0, 2, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 2, 2, 2, 1, 1, 1, 1, 2, 1, 0, 2, 1] },
  { id: 3, userId: 2, examId: 1, score: 9.0, correct: 18, total: 20, timeUsed: 20, date: '2026-02-11', answers: [2, 1, 0, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 2, 2, 2, 1, 1, 1, 1] },
  { id: 4, userId: 3, examId: 1, score: 6.0, correct: 12, total: 20, timeUsed: 28, date: '2026-02-12', answers: [1, 1, 0, 1, 1, 2, 1, 2, 1, 0, 2, 2, 0, 2, 2, 2, 1, 1, 0, 1] },
  { id: 5, userId: 4, examId: 3, score: 8.0, correct: 20, total: 25, timeUsed: 40, date: '2026-02-20', answers: [2, 0, 2, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 2, 2, 2, 1, 1, 1, 1, 2, 1, 2, 2, 1] },
  { id: 6, userId: 5, examId: 1, score: 7.5, correct: 15, total: 20, timeUsed: 25, date: '2026-02-14', answers: [2, 1, 0, 1, 0, 2, 2, 2, 1, 1, 2, 2, 1, 2, 2, 2, 0, 1, 1, 1] },
  { id: 7, userId: 2, examId: 3, score: 5.6, correct: 14, total: 25, timeUsed: 44, date: '2026-02-22', answers: [2, 0, 2, 1, 1, 2, 1, 2, 1, 1, 2, 1, 1, 2, 2, 0, 1, 1, 1, 1, 2, 1, 0, 2, 0] },
  { id: 8, userId: 1, examId: 5, score: 9.0, correct: 18, total: 20, timeUsed: 18, date: '2026-03-01', answers: [2, 1, 0, 1, 1, 2, 2, 2, 1, 1, 2, 2, 1, 2, 2, 2, 1, 1, 1, 1] }
];

export const ADMIN_CREDENTIAL = {
  username: 'admin',
  password: 'admin123',
  name: 'Admin PTIT'
};
