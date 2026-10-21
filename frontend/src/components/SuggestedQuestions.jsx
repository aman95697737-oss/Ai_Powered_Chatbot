import React from 'react';
import { 
  Clock, 
  Award, 
  Calendar, 
  BookOpen, 
  FileText, 
  Briefcase, 
  Home, 
  HelpCircle,
  CreditCard
} from 'lucide-react';

const SUGGESTIONS = [
  {
    category: "Attendance",
    question: "What is the minimum attendance requirement?",
    icon: Clock,
    color: "#ffd700"
  },
  {
    category: "Scholarships",
    question: "How can I apply for a scholarship?",
    icon: Award,
    color: "#facc15"
  },
  {
    category: "Examination",
    question: "When are semester end examinations conducted and where is the schedule?",
    icon: Calendar,
    color: "#ffe600"
  },
  {
    category: "Library",
    question: "What are the Central Library operating hours and holiday schedules?",
    icon: BookOpen,
    color: "#ffd700"
  },
  {
    category: "Admission",
    question: "What documents are required for university admission?",
    icon: FileText,
    color: "#facc15"
  },
  {
    category: "Internships",
    question: "Is an internship mandatory for graduation and how many credits does it carry?",
    icon: Briefcase,
    color: "#ffe600"
  },
  {
    category: "Fees",
    question: "Can I pay my semester fees in installments?",
    icon: CreditCard,
    color: "#ffd700"
  },
  {
    category: "Hostel",
    question: "What are the hostel curfew timings and night out-pass procedures?",
    icon: Home,
    color: "#facc15"
  }
];

export default function SuggestedQuestions({ onSelectQuestion }) {
  return (
    <div className="suggested-container">
      <div className="suggested-header">
        <span className="suggested-title text-gradient-sunset">Popular University Inquiries</span>
        <span className="suggested-sub">Click any question to ask instantly</span>
      </div>

      <div className="suggested-grid">
        {SUGGESTIONS.map((item, index) => {
          const Icon = item.icon || HelpCircle;
          return (
            <button
              key={index}
              className="suggested-card"
              onClick={() => onSelectQuestion(item.question)}
            >
              <div className="card-top">
                <span 
                  className="card-category-badge"
                  style={{ 
                    borderColor: `${item.color}55`,
                    background: `${item.color}18`,
                    color: item.color 
                  }}
                >
                  <Icon size={12} />
                  <span>{item.category}</span>
                </span>
              </div>
              <p className="card-question">{item.question}</p>
            </button>
          );
        })}
      </div>

      <style>{`
        .suggested-container {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .suggested-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          padding: 0 4px;
        }
        .suggested-title {
          font-size: 0.85rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .suggested-sub {
          font-size: 0.78rem;
          color: #d1d5db;
        }
        .suggested-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 12px;
        }
        @media (max-width: 640px) {
          .suggested-grid {
            grid-template-columns: 1fr;
          }
          .suggested-header {
            flex-direction: column;
            gap: 4px;
          }
        }
        .suggested-card {
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
          cursor: pointer;
          text-align: left;
          border-radius: var(--radius-md);
          background: #0f0f14;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .suggested-card:hover {
          background: #16161e;
          border-color: rgba(250, 204, 21, 0.6);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.8), 0 0 14px rgba(250, 204, 21, 0.25);
        }
        .card-top {
          display: flex;
          align-items: center;
        }
        .card-category-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: var(--radius-full);
          border: 1px solid;
        }
        .card-question {
          font-size: 0.875rem;
          font-weight: 600;
          color: #ffffff;
          line-height: 1.45;
        }
      `}</style>
    </div>
  );
}
