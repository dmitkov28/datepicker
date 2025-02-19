class DatePicker extends HTMLElement {
  private shadow: ShadowRoot;
  private selectedDate: Date;
  private monthNames: string[];
  private weekdayNames: string[];
  private currentMonth: number;
  private currentYear: number;
  private dateInput: HTMLInputElement | null = null;
  private calendarContainer: HTMLDivElement | null = null;

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.selectedDate = new Date();
    this.currentMonth = this.selectedDate.getMonth();
    this.currentYear = this.selectedDate.getFullYear();
    this.monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    this.render();
    this.attachEventListeners();
  }

  static get observedAttributes() {
    return ["value", "min", "max", "disabled", "name"];
  }

  attributeChangedCallback(name: string, newValue: string) {
    if (name === "value" && newValue) {
      const date = new Date(newValue);
      if (!isNaN(date.getTime())) {
        this.selectedDate = date;
        this.currentMonth = date.getMonth();
        this.currentYear = date.getFullYear();
        this.updateUI();
      }
    }

    if (name === "disabled") {
      this.updateUI();
    }
  }

  connectedCallback() {
    this.updateUI();
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  private parseDate(dateString: string): Date {
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  private getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  private getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }

  private toggleCalendar() {
    if (!this.calendarContainer) return;

    const isVisible = this.calendarContainer.style.display === "block";
    this.calendarContainer.style.display = isVisible ? "none" : "block";

    if (!isVisible) {
      this.renderCalendar();
    }
  }

  private renderCalendar() {
    if (!this.calendarContainer) return;

    const calendarHeader = document.createElement("div");
    calendarHeader.className = "calendar-header";

    const prevButton = document.createElement("button");
    prevButton.innerHTML = "&laquo;";
    prevButton.className = "month-nav";
    prevButton.addEventListener("click", () => this.prevMonth());

    const nextButton = document.createElement("button");
    nextButton.innerHTML = "&raquo;";
    nextButton.className = "month-nav";
    nextButton.addEventListener("click", () => this.nextMonth());

    const monthYearLabel = document.createElement("span");
    monthYearLabel.textContent = `${this.monthNames[this.currentMonth]} ${this.currentYear}`;

    calendarHeader.appendChild(prevButton);
    calendarHeader.appendChild(monthYearLabel);
    calendarHeader.appendChild(nextButton);

    const daysGrid = document.createElement("div");
    daysGrid.className = "days-grid";

    this.weekdayNames.forEach((weekday) => {
      const weekdayEl = document.createElement("div");
      weekdayEl.className = "weekday";
      weekdayEl.textContent = weekday;
      daysGrid.appendChild(weekdayEl);
    });

    const daysInMonth = this.getDaysInMonth(
      this.currentYear,
      this.currentMonth,
    );
    const firstDay = this.getFirstDayOfMonth(
      this.currentYear,
      this.currentMonth,
    );

    for (let i = 0; i < firstDay; i++) {
      const emptyDay = document.createElement("div");
      emptyDay.className = "day empty";
      daysGrid.appendChild(emptyDay);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dayEl = document.createElement("div");
      dayEl.className = "day";
      dayEl.textContent = i.toString();

      const date = new Date(this.currentYear, this.currentMonth, i);
      if (
        this.selectedDate &&
        date.getDate() === this.selectedDate.getDate() &&
        date.getMonth() === this.selectedDate.getMonth() &&
        date.getFullYear() === this.selectedDate.getFullYear()
      ) {
        dayEl.classList.add("selected");
      }

      dayEl.addEventListener("click", () => {
        this.selectedDate = new Date(this.currentYear, this.currentMonth, i);
        if (this.dateInput) {
          this.dateInput.value = this.formatDate(this.selectedDate);
        }
        this.dispatchEvent(
          new CustomEvent("change", {
            detail: { date: this.selectedDate },
          }),
        );
        this.toggleCalendar();
        this.updateUI();
      });

      daysGrid.appendChild(dayEl);
    }

    this.calendarContainer.innerHTML = "";
    this.calendarContainer.appendChild(calendarHeader);
    this.calendarContainer.appendChild(daysGrid);
  }

  private prevMonth() {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.renderCalendar();
  }

  private nextMonth() {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.renderCalendar();
  }

  private attachEventListeners() {
    this.shadow.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;

      if (target === this.dateInput) {
        this.toggleCalendar();
      }

      if (
        this.calendarContainer &&
        this.calendarContainer.style.display === "block" &&
        !this.calendarContainer.contains(target) &&
        target !== this.dateInput &&
        !target.classList.contains("month-nav")
      ) {
        console.log(this.calendarContainer);
        this.calendarContainer.style.display = "none";
      }
    });
  }

  private updateUI() {
    if (this.dateInput) {
      if (this.hasAttribute("name") && this.dateInput) {
        this.dateInput.name = this.getAttribute("name")!;
      }
      this.dateInput.value = this.selectedDate
        ? this.formatDate(this.selectedDate)
        : "";

      if (this.hasAttribute("disabled")) {
        this.dateInput.setAttribute("disabled", "");
      } else {
        this.dateInput.removeAttribute("disabled");
      }
    }
  }

  private render() {
    const styles = document.createElement("style");
    styles.textContent = `
      :host {
        display: inline-block;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        position: relative;
      }
      
      .date-picker-container {
        position: relative;
      }
      
      .date-input {
        padding: 8px 12px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 16px;
        width: 120px;
        cursor: pointer;
      }
      
      .calendar-container {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        margin-top: 4px;
        width: 280px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 10;
      }
      
      .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px;
        background: #f5f5f5;
        border-bottom: 1px solid #eee;
      }
      
      .month-nav {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 18px;
        padding: 4px 8px;
      }
      
      .month-nav:hover {
        background: #e0e0e0;
        border-radius: 4px;
      }
      
      .days-grid {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        padding: 10px;
      }
      
      .weekday {
        text-align: center;
        font-weight: bold;
        margin-bottom: 8px;
        font-size: 12px;
        color: #666;
      }
      
      .day {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 32px;
        cursor: pointer;
        border-radius: 50%;
        margin: 2px;
      }
      
      .day:hover {
        background: #f0f0f0;
      }
      
      .day.selected {
        background: #2563eb;
        color: white;
      }
      
      .day.empty {
        cursor: default;
      }
    `;

    const container = document.createElement("div");
    container.className = "date-picker-container";

    this.dateInput = document.createElement("input");
    this.dateInput.type = "text";
    this.dateInput.className = "date-input";
    this.dateInput.readOnly = true;
    this.dateInput.placeholder = "Select date";
    this.dateInput.value = this.selectedDate
      ? this.formatDate(this.selectedDate)
      : "";

    this.calendarContainer = document.createElement("div");
    this.calendarContainer.className = "calendar-container";

    container.appendChild(this.dateInput);
    container.appendChild(this.calendarContainer);

    this.shadow.appendChild(styles);
    this.shadow.appendChild(container);
  }

  public getValue(): string {
    return this.selectedDate ? this.formatDate(this.selectedDate) : "";
  }

  public setValue(dateString: string): void {
    const date = this.parseDate(dateString);
    if (!isNaN(date.getTime())) {
      this.selectedDate = date;
      this.currentMonth = date.getMonth();
      this.currentYear = date.getFullYear();
      this.updateUI();
    }
  }

  public disable(): void {
    this.setAttribute("disabled", "");
  }

  public enable(): void {
    this.removeAttribute("disabled");
  }
}

customElements.define("date-picker", DatePicker);
