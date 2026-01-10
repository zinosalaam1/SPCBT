import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  House,
  BookOpen,
  Trophy,
  LogOut,
  Clock,
  CirclePlay,
  CheckCircle,
  Award,
  TrendingUp,
  Target,
  GraduationCap,
  CircleAlert,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

import {
  getActiveExams,
} from '../services/exams';

import {
  getMyAttempts,
  createAttempt,
} from '../services/attempts';


import {
  getQuestionsByIds,
} from '../services/questions';




import { User, Exam, Question, ExamAttempt } from '../types';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
}

export function StudentDashboard({ user, onLogout }: StudentDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [currentExam, setCurrentExam] = useState<Exam | null>(null);
  const [examQuestions, setExamQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const [isExamSubmitted, setIsExamSubmitted] = useState(false);

  useEffect(() => {
  if (!user?._id) return;

  loadData().catch(console.error);
}, [user?._id]);


  useEffect(() => {
    if (currentExam && timeRemaining > 0 && !isExamSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [currentExam, timeRemaining, isExamSubmitted]);

const loadData = async () => {
  if (!user?._id) return;

  const [e, a] = await Promise.all([
  getActiveExams(),
  getMyAttempts(),
]);


  setExams(e);
  setAttempts(Array.isArray(a) ? a : []);
};




  const handleStartExam = async (exam: Exam) => {
    const questions = await getQuestionsByIds(exam.questions);

    setCurrentExam(exam);
    setExamQuestions(questions);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTimeRemaining(exam.duration * 60);
    setExamStartTime(new Date());
    setIsExamSubmitted(false);
    setActiveTab('taking-exam');
  };

  const handleAnswerChange = (questionId: string, answerIndex: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerIndex }));
  };

  const handleSubmitExam = async () => {
    if (!currentExam || !examStartTime) return;

    const endTime = new Date();
    const timeTaken = Math.floor(
      (endTime.getTime() - examStartTime.getTime()) / 1000
    );

    const formattedAnswers = examQuestions.map((q) => ({
      question: q._id,
      selectedOption: answers[q._id] ?? -1,
    }));

    await createAttempt({
      examId: currentExam._id,
      answers: formattedAnswers,
      startedAt: examStartTime.toISOString(),
      submittedAt: endTime.toISOString(),
      timeTaken,
    });

    setIsExamSubmitted(true);
    await loadData();
    setActiveTab('results');
  };

  const stats = {
    totalExams: attempts.length,
    averageScore:
      attempts.length > 0
        ? Math.round(
            attempts.reduce(
              (sum, a) =>
                sum + ((a.score || 0) / (a.totalQuestions || 1)) * 100,
              0
            ) / attempts.length
          )
        : 0,
    highestScore:
      attempts.length > 0
        ? Math.max(
            ...attempts.map((a) =>
              Math.round(((a.score || 0) / (a.totalQuestions || 1)) * 100)
            )
          )
        : 0,
    passedExams: attempts.filter(
      (a) => ((a.score || 0) / (a.totalQuestions || 1)) * 100 >= 40
    ).length,
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const currentQuestion = examQuestions[currentQuestionIndex];


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
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
                className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
              >
                <GraduationCap className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Sp-Tech Student
                </h1>
                <p className="text-sm text-gray-600">Hello, {user.name}!</p>
              </div>
            </div>
            {activeTab !== 'taking-exam' && (
              <Button
                onClick={onLogout}
                variant="outline"
                className="border-2 border-red-200 hover:bg-red-50 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            )}
          </div>
        </div>
      </motion.header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab !== 'taking-exam' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white shadow-lg p-1 h-auto">
              <TabsTrigger
                value="home"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3"
              >
                <House className="w-4 h-4 mr-2" />
                Home
              </TabsTrigger>
              <TabsTrigger
                value="exams"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Exams
              </TabsTrigger>
              <TabsTrigger
                value="results"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white py-3"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Results
              </TabsTrigger>
            </TabsList>

            {/* Home Tab */}
            <TabsContent value="home" className="space-y-6">
              {/* Stats Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {[
                  {
                    icon: BookOpen,
                    label: 'Exams Taken',
                    value: stats.totalExams,
                    color: 'from-blue-500 to-cyan-500',
                    bgColor: 'bg-blue-50',
                  },
                  {
                    icon: TrendingUp,
                    label: 'Average Score',
                    value: `${stats.averageScore}%`,
                    color: 'from-purple-500 to-pink-500',
                    bgColor: 'bg-purple-50',
                  },
                  {
                    icon: Trophy,
                    label: 'Highest Score',
                    value: `${stats.highestScore}%`,
                    color: 'from-yellow-500 to-orange-500',
                    bgColor: 'bg-yellow-50',
                  },
                  {
                    icon: Award,
                    label: 'Passed Exams',
                    value: stats.passedExams,
                    color: 'from-green-500 to-emerald-500',
                    bgColor: 'bg-green-50',
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
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}
                          >
                            <stat.icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Available Exams */}
              <Card className="p-6 bg-white shadow-lg border-0">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Available Exams
                </h3>
                <div className="grid gap-4">
                  {exams.slice(0, 3).map((exam, index) => {
                    const hasAttempted = attempts.some((a) => a.examId === exam._id);
                    return (
                      <motion.div
                        key={exam._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold">{exam.title}</h4>
                              <p className="text-sm text-gray-600">
                                {exam.questions.length} Questions • {exam.duration} Minutes
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {hasAttempted && (
                              <Badge className="bg-green-100 text-green-700">Attempted</Badge>
                            )}
                            <Button
                              onClick={() => handleStartExam(exam)}
                              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                              <CirclePlay className="w-4 h-4 mr-2" />
                              {hasAttempted ? 'Retake' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {exams.length === 0 && (
                    <p className="text-center text-gray-500 py-8">No exams available at the moment</p>
                  )}
                </div>
              </Card>

              {/* Recent Results */}
              {attempts.length > 0 && (
                <Card className="p-6 bg-white shadow-lg border-0">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-purple-600" />
                    Recent Performance
                  </h3>
                  <div className="space-y-3">
                    {attempts.slice(-3).reverse().map((attempt, index) => {
                      const exam = exams.find((e) => e._id === attempt.examId);
                      const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                      const passed = percentage >= 40;

                      return (
                        <motion.div
                          key={attempt._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{exam?.title || 'Unknown Exam'}</h4>
                            <Badge className={passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {passed ? 'Passed' : 'Failed'}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-600">
                              Score: {attempt.correctAnswers}/{attempt.totalQuestions}
                            </span>
                            <span className={`text-lg font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                              {percentage}%
                            </span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </motion.div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Exams Tab */}
            <TabsContent value="exams" className="space-y-6">
              <div className="grid gap-6">
                {exams.map((exam, index) => {
                  const hasAttempted = attempts.some((a) => a.examId === exam._id);
                  const lastAttempt = attempts
                    .filter((a) => a.examId === exam._id)
                    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())[0];

                  return (
                    <motion.div
                      key={exam._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all border-0">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-2xl font-bold">{exam.title}</h3>
                              {hasAttempted && (
                                <Badge className="bg-green-100 text-green-700">Attempted</Badge>
                              )}
                            </div>
                            <p className="text-gray-600 mb-4">{exam.subject}</p>
                            
                            <div className="grid grid-cols-4 gap-4 mb-4">
                              <div className="p-3 bg-purple-50 rounded-lg">
                                <p className="text-xs text-purple-600 mb-1">Questions</p>
                                <p className="text-xl font-bold text-purple-700">{exam.questions.length}</p>
                              </div>
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-600 mb-1">Duration</p>
                                <p className="text-xl font-bold text-blue-700">{exam.duration}m</p>
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

                            {lastAttempt && (
                              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                                <p className="text-sm text-gray-600 mb-1">Your Last Score</p>
                                <div className="flex items-center gap-3">
                                  <p className="text-2xl font-bold text-purple-600">
                                    {Math.round((lastAttempt.score / lastAttempt.totalQuestions) * 100)}%
                                  </p>
                                  <span className="text-sm text-gray-600">
                                    ({lastAttempt.correctAnswers}/{lastAttempt.totalQuestions} correct)
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <Button
                            onClick={() => handleStartExam(exam)}
                            size="lg"
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg"
                          >
                            <CirclePlay className="w-5 h-5 mr-2" />
                            {hasAttempted ? 'Retake Exam' : 'Start Exam'}
                          </Button>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
                {exams.length === 0 && (
                  <Card className="p-12 bg-white shadow-md text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No exams available</p>
                    <p className="text-gray-500 text-sm">Check back later for new exams</p>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-6">
              <div className="grid gap-4">
                {attempts.length > 0 ? (
                  [...attempts].reverse().map((attempt, index) => {
                    const exam = exams.find((e) => e._id === attempt.examId);
                    const percentage = Math.round((attempt.score / attempt.totalQuestions) * 100);
                    const passed = percentage >= 40;
                    const timeTakenMinutes = Math.floor(attempt.timeTaken / 60);
                    const timeTakenSeconds = attempt.timeTaken % 60;

                    return (
                      <motion.div
                        key={attempt._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-6 bg-white shadow-lg hover:shadow-xl transition-all border-0">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold">{exam?.title || 'Unknown Exam'}</h3>
                                <Badge className={passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                  {passed ? 'Passed' : 'Failed'}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-4">
                                Submitted on {new Date(attempt.submittedAt).toLocaleString()}
                              </p>

                              <div className="grid grid-cols-4 gap-4 mb-4">
                                <div className={`p-4 rounded-lg ${passed ? 'bg-green-50' : 'bg-red-50'}`}>
                                  <p className={`text-xs mb-1 ${passed ? 'text-green-600' : 'text-red-600'}`}>
                                    Score
                                  </p>
                                  <p className={`text-3xl font-bold ${passed ? 'text-green-700' : 'text-red-700'}`}>
                                    {percentage}%
                                  </p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-lg">
                                  <p className="text-xs text-blue-600 mb-1">Correct</p>
                                  <p className="text-3xl font-bold text-blue-700">{attempt.correctAnswers}</p>
                                </div>
                                <div className="p-4 bg-purple-50 rounded-lg">
                                  <p className="text-xs text-purple-600 mb-1">Wrong</p>
                                  <p className="text-3xl font-bold text-purple-700">
                                    {attempt.totalQuestions - attempt.correctAnswers}
                                  </p>
                                </div>
                                <div className="p-4 bg-orange-50 rounded-lg">
                                  <p className="text-xs text-orange-600 mb-1">Time</p>
                                  <p className="text-3xl font-bold text-orange-700">
                                    {timeTakenMinutes}:{timeTakenSeconds.toString().padStart(2, '0')}
                                  </p>
                                </div>
                              </div>

                              <div className="mb-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Performance</span>
                                  <span className="text-sm font-medium">{percentage}%</span>
                                </div>
                                <Progress value={percentage} className="h-3" />
                              </div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    );
                  })
                ) : (
                  <Card className="p-12 bg-white shadow-md text-center">
                    <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No exam results yet</p>
                    <p className="text-gray-500 text-sm mb-6">Start taking exams to see your results here</p>
                    <Button
                      onClick={() => setActiveTab('exams')}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      Browse Exams
                    </Button>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          /* Taking Exam View */
          <AnimatePresence>
            {currentExam && currentQuestion && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto"
              >
                {/* Exam Header */}
                <Card className="p-6 mb-6 bg-white shadow-lg border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold mb-1">{currentExam.title}</h2>
                      <p className="text-gray-600">
                        Question {currentQuestionIndex + 1} of {examQuestions.length}
                      </p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Progress</p>
                        <p className="text-xl font-bold text-purple-600">
                          {Math.round(((currentQuestionIndex + 1) / examQuestions.length) * 100)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600 mb-1">Time Left</p>
                        <div
                          className={`text-2xl font-bold ${
                            timeRemaining < 60 ? 'text-red-600' : 'text-green-600'
                          }`}
                        >
                          <Clock className="w-5 h-5 inline mr-1" />
                          {formatTime(timeRemaining)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Progress
                    value={((currentQuestionIndex + 1) / examQuestions.length) * 100}
                    className="mt-4 h-2"
                  />
                </Card>

                {/* Question Card */}
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="p-8 bg-white shadow-lg border-0 mb-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xl font-bold">{currentQuestionIndex + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-semibold mb-4">{currentQuestion.question}</h3>
                        <RadioGroup
                          value={answers[currentQuestion._id]?.toString() || ''}
                          onValueChange={(value) => handleAnswerChange(currentQuestion._id, parseInt(value))}
                        >
                          <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => (
                              <motion.div
                                key={index}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <label
                                  className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                    answers[currentQuestion._id] === index
                                      ? 'border-purple-600 bg-purple-50'
                                      : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                  }`}
                                >
                                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-lg">
                                    {option}
                                  </Label>
                                </label>
                              </motion.div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                {/* Navigation */}
                <Card className="p-6 bg-white shadow-lg border-0">
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentQuestionIndex === 0}
                      variant="outline"
                      size="lg"
                    >
                      Previous
                    </Button>

                    <div className="flex items-center gap-2">
                      {examQuestions.map((_, index) => (
                        <motion.button
                          key={index}
                          onClick={() => setCurrentQuestionIndex(index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all ${
                            index === currentQuestionIndex
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                              : answers[examQuestions[index]._id] !== undefined
                              ? 'bg-green-100 text-green-700 border border-green-300'
                              : 'bg-gray-100 text-gray-600 border border-gray-300'
                          }`}
                        >
                          {index + 1}
                        </motion.button>
                      ))}
                    </div>

                    {currentQuestionIndex === examQuestions.length - 1 ? (
                      <Button
                        onClick={handleSubmitExam}
                        size="lg"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
                      >
                        Submit Exam
                        <CheckCircle className="w-5 h-5 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setCurrentQuestionIndex((prev) => Math.min(examQuestions.length - 1, prev + 1))}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-pink-600"
                      >
                        Next
                        <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    )}
                  </div>
                </Card>

                {/* Warning */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6"
                >
                  <Card className="p-4 bg-yellow-50 border-yellow-200 border-2">
                    <div className="flex items-center gap-3 text-yellow-800">
                      <CircleAlert className="w-5 h-5" />
                      <p className="text-sm">
                        Make sure to answer all questions before submitting. Once submitted, you cannot change your
                        answers.
                      </p>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}