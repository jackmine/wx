const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, "public");

const patientOverview = {
  name: "张怡宁",
  memberLevel: "金卡会员",
  upcomingAppointment: {
    date: "2024-08-22 14:30",
    department: "心血管内科",
    doctor: "刘海涛 主任医师"
  },
  carePlan: ["每日服药提醒", "每周血压复测", "30分钟有氧运动"],
  healthStats: {
    bloodPressure: "118/76",
    bloodSugar: "5.4 mmol/L",
    weight: "56.8 kg",
    lastSync: "今天 08:45"
  },
  serviceStatus: {
    onlineDoctor: "王静 医生",
    responseTime: "平均 3 分钟",
    serviceScore: "4.9"
  }
};

const doctorOverview = {
  name: "刘海涛",
  title: "主任医师",
  department: "心血管内科",
  todaySchedule: {
    total: 18,
    online: 12,
    inPerson: 6
  },
  patientQueue: [
    { name: "张怡宁", tag: "高血压随访", status: "等待复诊" },
    { name: "李文倩", tag: "心悸", status: "视频问诊中" },
    { name: "赵明", tag: "药物咨询", status: "待分诊" }
  ],
  alerts: [
    "3 位慢病患者血压异常",
    "2 份影像报告待审核",
    "5 份处方续方待确认"
  ],
  performance: {
    satisfaction: "98%",
    responseTime: "2.4 分钟",
    consults: 132
  }
};

const appointments = [
  {
    id: "AP-20240818-001",
    patient: "张怡宁",
    doctor: "刘海涛",
    time: "2024-08-22 14:30",
    type: "视频问诊",
    status: "已确认"
  },
  {
    id: "AP-20240818-002",
    patient: "李文倩",
    doctor: "刘海涛",
    time: "2024-08-22 16:00",
    type: "到院复诊",
    status: "待确认"
  },
  {
    id: "AP-20240818-003",
    patient: "赵明",
    doctor: "王静",
    time: "2024-08-23 09:00",
    type: "续方咨询",
    status: "待接诊"
  }
];

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8"
};

const sendJson = (res, data) => {
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
};

const handleApi = (req, res, url) => {
  if (url.pathname === "/api/patient/overview") {
    return sendJson(res, patientOverview);
  }
  if (url.pathname === "/api/doctor/overview") {
    return sendJson(res, doctorOverview);
  }
  if (url.pathname === "/api/appointments") {
    const role = url.searchParams.get("role");
    if (role === "patient") {
      return sendJson(
        res,
        appointments.filter((item) => item.patient === patientOverview.name)
      );
    }
    if (role === "doctor") {
      return sendJson(
        res,
        appointments.filter((item) => item.doctor === doctorOverview.name)
      );
    }
    return sendJson(res, appointments);
  }
  res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify({ message: "Not Found" }));
};

const serveStatic = (res, filePath) => {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Not Found");
      return;
    }
    const ext = path.extname(filePath);
    const contentType = mimeTypes[ext] || "text/plain; charset=utf-8";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  });
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname.startsWith("/api/")) {
    return handleApi(req, res, url);
  }

  const sanitizedPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.join(publicDir, sanitizedPath);
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad Request");
    return;
  }
  serveStatic(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
