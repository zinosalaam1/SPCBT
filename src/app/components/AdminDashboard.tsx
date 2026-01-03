import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  FileQuestion,
  Users,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Award,
  CircleCheck,
  CircleX,
  Clock,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

import * as questionService from '../services/questions';
import * as examService from '../services/exams';
import * as userService from '../services/users';
import * as attemptService from '../services/attempts';

import { User, Question, Exam } from '../types';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [attempts, setAttempts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionForm, setQuestionForm] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    subject: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
  });

  const [isExamDialogOpen, setIsExamDialogOpen] = useState(false);
  const [examForm, setExamForm] = useState({
    title: '',
    subject: '',
    duration: 60,
    selectedQuestions: [] as string[],
    totalMarks: 100,
    passingMarks: 40,
    isActive: true,
  });

  const [isStudentDialogOpen, setIsStudentDialogOpen] = useState(false);
  const [studentForm, setStudentForm] = useState({
    username: '',
    password: '',
    name: '',
    email: '',
  });

  useEffect(() => {
    console.log('ADMIN ATTEMPTS:', attempts);
  }, [attempts]);


  useEffect(() => {
    loadData().catch(console.error);
  }, []);

  const loadData = async () => {
    try {
      const [q, e, u, a] = await Promise.all([
        questionService.getQuestions(),
        examService.getExams(),
        userService.getUsers(),
        attemptService.getAllAttempts(),
      ]);

      setQuestions(q);
      setExams(e);
      setStudents(u.filter((u: User) => u.role === 'student'));
      setAttempts(Array.isArray(a) ? a : a?.attempts ?? []);

    } catch (err) {
      console.error('Error loading data:', err);
    }
  };


  
  // ---------------- QUESTIONS ----------------
  const handleCreateQuestion = async () => {
    try {
      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion._id, questionForm);
      } else {
        await questionService.createQuestion(questionForm);
      }
      resetQuestionForm();
      await loadData();
    } catch (err) {
      console.error('Error saving question:', err);
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      await questionService.deleteQuestion(id);
      await loadData();
    }
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionForm({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.correctAnswer,
      subject: question.subject,
      difficulty: question.difficulty,
    });
    setIsQuestionDialogOpen(true);
  };

  const resetQuestionForm = () => {
    setQuestionForm({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      subject: '',
      difficulty: 'medium',
    });
    setEditingQuestion(null);
    setIsQuestionDialogOpen(false);
  };

  // ---------------- EXAMS ----------------
const handleCreateExam = async () => {
  try {
    if (!examForm.title || !examForm.subject || examForm.selectedQuestions.length === 0) {
      alert('Please fill all required fields and select at least one question.');
      return;
    }

    // Filter out any undefined or empty question IDs
    const questionIds = examForm.selectedQuestions.filter((q): q is string => !!q);

    if (questionIds.length === 0) {
      alert('Please select at least one valid question.');
      return;
    }

    const payload = {
      title: examForm.title,
      subject: examForm.subject,
      duration: examForm.duration,
      questions: questionIds, // safe array of strings
      totalMarks: examForm.totalMarks,
      passingMarks: examForm.passingMarks,
      isActive: examForm.isActive,
    };

    await examService.createExam(payload);
    resetExamForm();
    await loadData();
  } catch (err: any) {
    console.error('Error creating exam:', err.response?.data || err);
    alert(err.response?.data?.message || 'Failed to create exam.');
  }
};

const resetExamForm = () => {
  setExamForm({
    title: '',
    subject: '',
    duration: 60,
    selectedQuestions: [],
    totalMarks: 100,
    passingMarks: 40,
    isActive: true,
  });
  setIsExamDialogOpen(false);
};

const toggleExamStatus = async (examId: string, isActive: boolean) => {
  try {
    await examService.updateExam(examId, { isActive });
    await loadData();
  } catch (err) {
    console.error('Error updating exam status:', err);
  }
};
const handleDeleteExam = async (id: string) => {
  if (!id) {
    alert('Invalid exam ID');
    return;
  }

  const hasAttempts = attempts.some((a) => a.examId === id);

  if (hasAttempts) {
    alert('You cannot delete an exam that already has student attempts.');
    return;
  }

  if (!confirm('Are you sure you want to delete this exam?')) return;

  try {
    await examService.deleteExam(id);
    await loadData();
  } catch (err) {
    console.error('Error deleting exam:', err);
    alert('Failed to delete exam');
  }
};



  // ---------------- STUDENTS ----------------
  const handleCreateStudent = async () => {
    try {
      if (!studentForm.username || !studentForm.password || !studentForm.name || !studentForm.email) {
        alert('Please fill all student fields.');
        return;
      }
      await userService.createUser({
        ...studentForm,
        role: 'student',
      });
      resetStudentForm();
      await loadData();
    } catch (err) {
      console.error('Error creating student:', err);
    }
  };

  const resetStudentForm = () => {
    setStudentForm({
      username: '',
      password: '',
      name: '',
      email: '',
    });
    setIsStudentDialogOpen(false);
  };
const handleDeleteStudent = async (id: string) => {
  if (!confirm('Are you sure you want to delete this student?')) return;

  try {
    await userService.deleteUser(id);
    await loadData();
  } catch (err) {
    console.error('Failed to delete student:', err);
    alert('Failed to delete student');
  }
};

  // ---------------- STATS ----------------
const validAttempts = attempts.filter(a => a.totalQuestions > 0);

const stats = {
  totalQuestions: questions.length,
  totalExams: exams.length,
  activeExams: exams.filter((e) => e.isActive).length,
  totalStudents: students.length,
  totalAttempts: attempts.length,
  averageScore:
    validAttempts.length > 0
      ? Math.round(
          validAttempts.reduce(
            (sum, a) => sum + (a.score / a.totalQuestions) * 100,
            0
          ) / validAttempts.length
        )
      : 0,
};


  const filteredQuestions = questions.filter((q) => {
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      selectedDifficulty === 'all' || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesDifficulty;
  });


  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/90"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <GraduationCap className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Sp-Tech Admin
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-lg p-1 h-auto">
            <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="questions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3">
              <FileQuestion className="w-4 h-4 mr-2" />
              Questions
            </TabsTrigger>
            <TabsTrigger value="exams" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3">
              <BookOpen className="w-4 h-4 mr-2" />
              Exams
            </TabsTrigger>
            <TabsTrigger value="students" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white py-3">
              <Users className="w-4 h-4 mr-2" />
              Students
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                {
                  icon: FileQuestion,
                  label: 'Total Questions',
                  value: stats.totalQuestions,
                  color: 'from-blue-500 to-cyan-500',
                  bgColor: 'bg-blue-50',
                },
                {
                  icon: BookOpen,
                  label: 'Active Exams',
                  value: `${stats.activeExams}/${stats.totalExams}`,
                  color: 'from-purple-500 to-pink-500',
                  bgColor: 'bg-purple-50',
                },
                {
                  icon: Users,
                  label: 'Total Students',
                  value: stats.totalStudents,
                  color: 'from-green-500 to-emerald-500',
                  bgColor: 'bg-green-50',
                },
                {
                  icon: BarChart3,
                  label: 'Total Attempts',
                  value: stats.totalAttempts,
                  color: 'from-orange-500 to-red-500',
                  bgColor: 'bg-orange-50',
                },
                {
                  icon: TrendingUp,
                  label: 'Average Score',
                  value: `${stats.averageScore}%`,
                  color: 'from-indigo-500 to-blue-500',
                  bgColor: 'bg-indigo-50',
                },
                {
                  icon: Award,
                  label: 'Success Rate',
                  value: `${stats.averageScore >= 40 ? '✓' : '✗'}`,
                  color: 'from-yellow-500 to-amber-500',
                  bgColor: 'bg-yellow-50',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all border-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                        <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Recent Activity */}
            <Card className="p-6 bg-white shadow-lg border-0">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-600" />
                Recent Exam Attempts
              </h3>
              <div className="space-y-3">
                {attempts.slice(0, 5).map((attempt, index) => {
                  const student = students.find((s) => s._id === attempt.studentId);
                  const exam = exams.find((e) => e._id === attempt.examId);
                  const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                  
                  return (
                    <motion.div
                      key={attempt._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          percentage >= 40 ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {percentage >= 40 ? (
                            <CircleCheck className="w-5 h-5 text-green-600" />
                          ) : (
                            <CircleX className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{student?.name || 'Unknown Student'}</p>
                          <p className="text-sm text-gray-600">{exam?.title || 'Unknown Exam'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${percentage >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                          {percentage}%
                        </p>
                        <p className="text-sm text-gray-500">
                          {attempt.correctAnswers}/{attempt.totalQuestions}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                {attempts.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No exam attempts yet</p>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Questions Tab */}
          <TabsContent value="questions" className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white shadow-sm"
                  />
                </div>
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-40 bg-white shadow-sm">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isQuestionDialogOpen} onOpenChange={setIsQuestionDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? 'Edit Question' : 'Create New Question'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Question</Label>
                      <Textarea
                        value={questionForm.question}
                        onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                        placeholder="Enter your question"
                        rows={3}
                      />
                    </div>
                    {questionForm.options.map((option, index) => (
                      <div key={index}>
                        <Label>Option {index + 1}</Label>
                        <Input
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...questionForm.options];
                            newOptions[index] = e.target.value;
                            setQuestionForm({ ...questionForm, options: newOptions });
                          }}
                          placeholder={`Enter option ${index + 1}`}
                        />
                      </div>
                    ))}
                    <div>
                      <Label>Correct Answer</Label>
                      <Select
                        value={questionForm.correctAnswer.toString()}
                        onValueChange={(value) =>
                          setQuestionForm({ ...questionForm, correctAnswer: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionForm.options.map((_, index) => (
                            <SelectItem key={index} value={index.toString()}>
                              Option {index + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Subject</Label>
                        <Input
                          value={questionForm.subject}
                          onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })}
                          placeholder="e.g., Web Development"
                        />
                      </div>
                      <div>
                        <Label>Difficulty</Label>
                        <Select
                          value={questionForm.difficulty}
                          onValueChange={(value: any) =>
                            setQuestionForm({ ...questionForm, difficulty: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreateQuestion}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                      >
                        {editingQuestion ? 'Update' : 'Create'} Question
                      </Button>
                      <Button onClick={resetQuestionForm} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              <AnimatePresence>
                {filteredQuestions.map((question, index) => (
                  <motion.div
                    key={question._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-all border-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge
                              className={
                                question.difficulty === 'easy'
                                  ? 'bg-green-100 text-green-700'
                                  : question.difficulty === 'medium'
                                  ? 'bg-yellow-100 text-yellow-700'
                                  : 'bg-red-100 text-red-700'
                              }
                            >
                              {question.difficulty}
                            </Badge>
                            <Badge variant="outline">{question.subject}</Badge>
                          </div>
                          <h4 className="font-semibold text-lg mb-3">{question.question}</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {question.options.map((option, i) => (
                              <div
                                key={`${question._id}-${i}`}
                                className={`p-2 rounded-lg text-sm ${
                                  i === question.correctAnswer
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-gray-50 text-gray-700'
                                }`}
                              >
                                {i + 1}. {option}
                                {i === question.correctAnswer && ' ✓'}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditQuestion(question)}
                            className="border-blue-200 hover:bg-blue-50"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteQuestion(question._id)}
                            className="border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
              {filteredQuestions.length === 0 && (
                <Card className="p-12 bg-white shadow-md text-center">
                  <FileQuestion className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No questions found</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Exams Tab */}
          <TabsContent value="exams" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={isExamDialogOpen} onOpenChange={setIsExamDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Exam
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create New Exam</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Exam Title</Label>
                      <Input
                        value={examForm.title}
                        onChange={(e) => setExamForm({ ...examForm, title: e.target.value })}
                        placeholder="e.g., Web Development Final Exam"
                      />
                    </div>
                    <div>
                      <Label>Subject</Label>
                      <Input
                        value={examForm.subject}
                        onChange={(e) => setExamForm({ ...examForm, subject: e.target.value })}
                        placeholder="e.g., Web Development"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Duration (min)</Label>
                        <Input
                          type="number"
                          value={examForm.duration}
                          onChange={(e) =>
                            setExamForm({ ...examForm, duration: parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label>Total Marks</Label>
                        <Input
                          type="number"
                          value={examForm.totalMarks}
                          onChange={(e) =>
                            setExamForm({ ...examForm, totalMarks: parseInt(e.target.value) })
                          }
                        />
                      </div>
                      <div>
                        <Label>Passing Marks</Label>
                        <Input
                          type="number"
                          value={examForm.passingMarks}
                          onChange={(e) =>
                            setExamForm({ ...examForm, passingMarks: parseInt(e.target.value) })
                          }
                        />
                      </div>
                    </div>
              <div>
  <Label>Select Questions</Label>

  <div className="max-h-60 overflow-y-auto border rounded-lg p-3 space-y-2">
    {questions.map((q) => (
      <label
        key={q._id}
        className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
      >
        <input
          type="checkbox"
          checked={examForm.selectedQuestions.includes(q._id)}
          onChange={(e) => {
            if (e.target.checked) {
              setExamForm((prev) => ({
                ...prev,
                selectedQuestions: [...prev.selectedQuestions, q._id],
              }));
            } else {
              setExamForm((prev) => ({
                ...prev,
                selectedQuestions: prev.selectedQuestions.filter(
                  (id) => id !== q._id
                ),
              }));
            }
          }}
          className="mt-1"
        />

        <div className="flex-1">
          <p className="text-sm font-medium">{q.question}</p>
          <p className="text-xs text-gray-500">
            {q.subject} – {q.difficulty}
          </p>
        </div>
      </label>
    ))}
  </div>

  <p className="text-sm text-gray-600 mt-2">
    {examForm.selectedQuestions.length} question(s) selected
  </p>
</div>

    <div className="flex gap-2 pt-4">
       <Button
          onClick={handleCreateExam}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                        disabled={examForm.selectedQuestions.length === 0}
                      >
                        Create Exam
                      </Button>
                      <Button onClick={resetExamForm} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {exams.map((exam, index) => (
                <motion.div
                  key={exam._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-all border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold">{exam.title}</h3>
                          <Badge
                            className={
                              exam.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }
                          >
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-4">{exam.subject}</p>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-blue-600 mb-1">Questions</p>
                            <p className="text-xl font-bold text-blue-700">{exam.questions.length}</p>
                          </div>
                          <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-xs text-purple-600 mb-1">Duration</p>
                            <p className="text-xl font-bold text-purple-700">{exam.duration}m</p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-xs text-green-600 mb-1">Total Marks</p>
                            <p className="text-xl font-bold text-green-700">{exam.totalMarks}</p>
                          </div>
                          <div className="p-3 bg-orange-50 rounded-lg">
                            <p className="text-xs text-orange-600 mb-1">Pass Marks</p>
                            <p className="text-xl font-bold text-orange-700">{exam.passingMarks}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Switch
                          checked={exam.isActive}
                          onCheckedChange={(checked) => toggleExamStatus(exam._id, checked)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this exam?')) {
                              handleDeleteExam(exam._id);
                              loadData();
                            }
                          }}
                          className="border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {exams.length === 0 && (
                <Card className="p-12 bg-white shadow-md text-center">
                  <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No exams created yet</p>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="flex justify-end">
              <Dialog open={isStudentDialogOpen} onOpenChange={setIsStudentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Full Name</Label>
                      <Input
                        value={studentForm.name}
                        onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={studentForm.email}
                        onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                        placeholder="student@example.com"
                      />
                    </div>
                    <div>
                      <Label>Username</Label>
                      <Input
                        value={studentForm.username}
                        onChange={(e) => setStudentForm({ ...studentForm, username: e.target.value })}
                        placeholder="Enter username"
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={studentForm.password}
                        onChange={(e) => setStudentForm({ ...studentForm, password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={handleCreateStudent}
                        className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                      >
                        Add Student
                      </Button>
                      <Button onClick={resetStudentForm} variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {students.map((student, index) => {
                const studentAttempts = attempts.filter((a) => a.studentId === student._id);
                const avgScore = studentAttempts.length > 0
                  ? Math.round(
                      studentAttempts.reduce((sum, a) => sum + (a.score / a.totalQuestions) * 100, 0) /
                        studentAttempts.length
                    )
                  : 0;

                return (
                  <motion.div
                    key={student._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 bg-white shadow-md hover:shadow-lg transition-all border-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold">{student.name}</h3>
                            <p className="text-sm text-gray-600">{student.email}</p>
                            <p className="text-xs text-gray-500">@{student.username}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Exams Taken</p>
                            <p className="text-2xl font-bold text-indigo-600">{studentAttempts.length}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">Avg Score</p>
                            <p className="text-2xl font-bold text-purple-600">{avgScore}%</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (confirm(`Delete student ${student.name}?`)) {
                                handleDeleteStudent(student._id);
                                loadData();
                              }
                            }}
                            className="border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
              {students.length === 0 && (
                <Card className="p-12 bg-white shadow-md text-center">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No students registered yet</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}