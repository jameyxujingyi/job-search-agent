const jobs = [
  {
    id: 1,
    company: "Northstar AI",
    abbr: "NA",
    role: "AI 产品经理（校招）",
    location: "上海 · 27 届",
    direction: "AI 产品",
    match: 94,
    reason: "经历中包含生成式 AI 产品、模型评测与 A/B 测试，岗位要求高度重合。",
    deadline: "10 月 18 日",
    soon: true,
  },
  {
    id: 2,
    company: "Orbit Commerce",
    abbr: "OC",
    role: "平台产品经理",
    location: "深圳 · 27 届",
    direction: "产品经理",
    match: 91,
    reason: "电商产品与跨团队项目经验匹配，SQL 为明确加分项。",
    deadline: "10 月 20 日",
    soon: true,
  },
  {
    id: 3,
    company: "Morrow Data",
    abbr: "MD",
    role: "商业数据分析师",
    location: "杭州 · 27 届",
    direction: "数据分析",
    match: 88,
    reason: "能够独立搭建分析框架，并将用户行为数据转化为产品决策。",
    deadline: "10 月 24 日",
    soon: false,
  },
  {
    id: 4,
    company: "Fieldnote",
    abbr: "FN",
    role: "用户增长产品经理",
    location: "北京 · 27 届",
    direction: "产品经理",
    match: 84,
    reason: "留存诊断和回访入口优化经历可直接回应增长岗位职责。",
    deadline: "10 月 27 日",
    soon: false,
  },
  {
    id: 5,
    company: "Helio Robotics",
    abbr: "HR",
    role: "AI 解决方案产品",
    location: "上海 · 27 届",
    direction: "AI 产品",
    match: 81,
    reason: "AI 应用经验匹配，但 JD 更偏企业客户与解决方案交付。",
    deadline: "招满即止",
    soon: false,
  },
  {
    id: 6,
    company: "Lumen Media",
    abbr: "LM",
    role: "内容策略分析",
    location: "上海 · 27 届",
    direction: "数据分析",
    match: 78,
    reason: "内容推荐评测经验相关，但需要补充更明确的策略分析案例。",
    deadline: "11 月 2 日",
    soon: false,
  },
];

const pipelineData = [
  {
    title: "待准备",
    items: [
      { company: "Northstar AI", role: "AI 产品经理", meta: "匹配度 94% · 截止 10/18", action: "查看简历 Diff" },
      { company: "Orbit Commerce", role: "平台产品经理", meta: "匹配度 91% · 截止 10/20", action: "生成定制简历" },
    ],
  },
  {
    title: "网申中",
    items: [
      { company: "Morrow Data", role: "商业数据分析师", meta: "表单已填写 8/12 项", action: "继续填写" },
    ],
  },
  {
    title: "已投递",
    items: [
      { company: "Aurora Mobility", role: "产品培训生", meta: "10 月 12 日已同步飞书", action: "查看记录" },
      { company: "Common Goods", role: "数字化管培生", meta: "12 天未更新", action: "检查状态" },
    ],
  },
  {
    title: "后续节点",
    items: [
      { company: "Prism Cloud", role: "AI 产品经理", meta: "在线测评 · 10 月 16 日", action: "查看提醒" },
      { company: "Atlas Retail", role: "商业分析", meta: "一面 · 10 月 18 日", action: "准备面试" },
    ],
  },
];

const automationData = [
  ["⌕", "岗位增量扫描", "每天 09:30 · 公开招聘页与订阅信息源", true],
  ["≋", "推荐反馈学习", "根据待投递 / 舍弃决策更新岗位排序", true],
  ["◇", "简历适配建议", "确认投递后生成版本选择与修改 Diff", true],
  ["↗", "浏览器辅助申请", "保留最终提交前的人工确认", false],
  ["↻", "长期未更新检查", "每周一检查超过 14 天无变化的申请", true],
  ["▣", "投递状态同步", "将申请结果与后续节点写入飞书", true],
];

const decisions = new Map();
const selected = new Set();

const tableBody = document.querySelector("#job-table-body");
const selectedCount = document.querySelector("#selected-count");
const pendingStat = document.querySelector("#pending-stat");
const selectAll = document.querySelector("#select-all");
const toast = document.querySelector("#toast");
const modal = document.querySelector("#resume-modal");

function renderJobs() {
  tableBody.innerHTML = jobs
    .map((job) => {
      const decision = decisions.get(job.id);
      const decisionContent = decision
        ? `<span class="decision-badge ${decision === "approved" ? "approved" : "rejected"}">${decision === "approved" ? "待投递" : "已舍弃"}</span>`
        : `<div class="decision-buttons">
            <button class="table-action approve" data-action="approve" data-id="${job.id}">待投递</button>
            <button class="table-action" data-action="reject" data-id="${job.id}">舍弃</button>
          </div>`;

      return `<tr>
        <td class="check-cell"><input type="checkbox" class="job-check" data-id="${job.id}" ${selected.has(job.id) ? "checked" : ""} ${decision ? "disabled" : ""} /></td>
        <td><div class="company-cell"><span class="company-logo">${job.abbr}</span><div><strong>${job.role}</strong><span>${job.company} · ${job.location}</span></div></div></td>
        <td><span class="tag">${job.direction}</span></td>
        <td><div class="match"><strong>${job.match}%</strong><span class="match-bar"><i style="width:${job.match}%"></i></span></div></td>
        <td class="reason">${job.reason}</td>
        <td><span class="deadline ${job.soon ? "soon" : ""}">${job.deadline}</span></td>
        <td>${decisionContent}</td>
      </tr>`;
    })
    .join("");

  selectedCount.textContent = selected.size;
  pendingStat.textContent = jobs.filter((job) => !decisions.has(job.id)).length;
}

function renderKanban() {
  document.querySelector("#kanban").innerHTML = pipelineData
    .map(
      (column) => `<section class="kanban-column">
        <div class="kanban-column-header">${column.title}<span>${column.items.length}</span></div>
        ${column.items
          .map(
            (item) => `<article class="application-card">
              <div class="card-top"><span class="tag">${column.title}</span><small>•••</small></div>
              <h3>${item.role}</h3>
              <p>${item.company}</p>
              <small>${item.meta}</small>
              <button class="button secondary card-action" data-label="${item.action}">${item.action}</button>
            </article>`,
          )
          .join("")}
      </section>`,
    )
    .join("");
}

function renderAutomation() {
  document.querySelector("#automation-list").innerHTML = automationData
    .map(
      ([icon, title, subtitle, on], index) => `<div class="automation-item">
        <span class="automation-item-icon">${icon}</span>
        <div><strong>${title}</strong><span>${subtitle}</span></div>
        <button class="switch ${on ? "on" : ""}" data-switch="${index}" aria-label="切换 ${title}"></button>
      </div>`,
    )
    .join("");
}

function setDecision(ids, decision) {
  ids.forEach((id) => {
    decisions.set(id, decision);
    selected.delete(id);
  });
  selectAll.checked = false;
  renderJobs();
  showToast(decision === "approved" ? "已加入待投递列表，并记录本次推荐反馈" : "已舍弃，并用于调整后续推荐");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2300);
}

tableBody.addEventListener("change", (event) => {
  if (!event.target.matches(".job-check")) return;
  const id = Number(event.target.dataset.id);
  event.target.checked ? selected.add(id) : selected.delete(id);
  selectedCount.textContent = selected.size;
});

tableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  setDecision([Number(button.dataset.id)], button.dataset.action === "approve" ? "approved" : "rejected");
});

selectAll.addEventListener("change", () => {
  jobs.forEach((job) => {
    if (decisions.has(job.id)) return;
    selectAll.checked ? selected.add(job.id) : selected.delete(job.id);
  });
  renderJobs();
});

document.querySelector("#apply-selected").addEventListener("click", () => {
  if (!selected.size) return showToast("请先选择岗位");
  setDecision([...selected], "approved");
});

document.querySelector("#reject-selected").addEventListener("click", () => {
  if (!selected.size) return showToast("请先选择岗位");
  setDecision([...selected], "rejected");
});

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#${button.dataset.view}-view`).classList.add("active");
    document.querySelector("#page-title").textContent = button.textContent.trim().replace(/\d+$/, "");
  });
});

document.querySelector("#run-agent").addEventListener("click", (event) => {
  const button = event.currentTarget;
  button.disabled = true;
  button.textContent = "Agent 运行中…";
  window.setTimeout(() => {
    button.disabled = false;
    button.textContent = "运行一次 Agent";
    showToast("扫描完成：发现 2 个新增岗位，已完成去重与匹配评估");
  }, 900);
});

document.querySelector("#kanban").addEventListener("click", (event) => {
  const action = event.target.closest(".card-action");
  if (!action) return;
  if (action.dataset.label.includes("简历") || action.dataset.label === "生成定制简历") {
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
  } else {
    showToast(`${action.dataset.label}：演示任务已创建`);
  }
});

document.querySelector("#automation-list").addEventListener("click", (event) => {
  const toggle = event.target.closest(".switch");
  if (!toggle) return;
  toggle.classList.toggle("on");
  showToast(toggle.classList.contains("on") ? "自动化任务已启用" : "自动化任务已暂停");
});

document.querySelector("#close-modal").addEventListener("click", closeModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}

document.querySelector("#confirm-resume").addEventListener("click", () => {
  closeModal();
  showToast("定制简历已生成，可进入浏览器辅助申请");
});

document.querySelector("#browser-task").addEventListener("click", () => {
  closeModal();
  showToast("浏览器辅助任务已创建，最终提交前将等待确认");
});

document.querySelector("#save-preferences").addEventListener("click", () => showToast("求职偏好已保存，后续推荐将使用新规则"));
document.querySelector("#new-application").addEventListener("click", () => showToast("可从今日推荐中选择岗位加入流水线"));

renderJobs();
renderKanban();
renderAutomation();
