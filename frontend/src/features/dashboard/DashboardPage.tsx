import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/context/AuthContext';
import { useLearnStore } from '../../stores/learnStore';
import { useLabStore } from '../../stores/labStore';
import { useUIStore } from '../../stores/uiStore';
import { PageHeader, Card, ProgressBar, Button, Table, Spinner } from '../../components/common';
import { 
  BookOpen, 
  Monitor, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Sparkles,
  FlaskConical
} from 'lucide-react';
import styles from './DashboardPage.module.css';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { topics, loadProgress } = useLearnStore();
  const { experiments, loading: loadingExps, loadExperiments, deleteSavedExperiment } = useLabStore();
  const { addToast } = useUIStore();

  useEffect(() => {
    loadProgress();
    loadExperiments();
  }, [loadProgress, loadExperiments]);

  const completedTopicsCount = topics.filter(t => t.isComplete).length;
  const totalTopics = topics.length;
  const progressPercentage = totalTopics > 0 ? Math.round((completedTopicsCount / totalTopics) * 100) : 0;

  // Find next playable uncompleted topic or default to first
  const nextTopic = topics.find(t => !t.isComplete && t.content !== undefined) || topics[0];

  const handleDeleteExp = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSavedExperiment(id);
    addToast('Saved experiment deleted.', 'info');
  };

  const handleOpenExp = () => {
    navigate('/os-lab/cpu-scheduling');
  };

  return (
    <div className="container-width animate-fade-in" style={{ paddingBottom: '4rem' }}>
      
      {/* Welcome Banner */}
      <PageHeader 
        title={`Welcome back, ${user?.name || 'Student'}`}
        description="Track your operating systems curriculum progress and manage your laboratory simulations."
      />

      <div className={styles.dashboardGrid}>
        
        {/* Main Column */}
        <div className={styles.mainCol}>
          
          {/* Continue Learning Section */}
          <Card className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.headerInfo}>
                <BookOpen size={20} className={styles.headerIcon} />
                <h2>Curriculum Progress</h2>
              </div>
              <span className={styles.progressBadge}>{completedTopicsCount} of {totalTopics} Modules</span>
            </div>

            <p className={styles.sectionDesc}>
              Master foundational operating systems principles through structured lessons and hands-on scenarios.
            </p>

            <div className={styles.progressWrapper}>
              <ProgressBar value={progressPercentage} size="md" showValue />
            </div>

            <div className={styles.continueBox}>
              <div>
                <span className={styles.continueSub}>Up Next:</span>
                <div className={styles.continueTitle}>{nextTopic ? nextTopic.title : 'All Topics Completed!'}</div>
              </div>
              {nextTopic && (
                <Button 
                  onClick={() => navigate(`/learn/${nextTopic.slug}`)} 
                  variant="primary"
                  rightIcon={<ArrowRight size={14} />}
                >
                  Continue Learning
                </Button>
              )}
            </div>
          </Card>

          {/* Recent Experiments Section */}
          <Card className={styles.sectionCard}>
            <div className={styles.cardHeaderRow}>
              <div className={styles.headerInfo}>
                <FlaskConical size={20} className={styles.headerIcon} />
                <h2>Recent Saved Experiments</h2>
              </div>
              <Button 
                onClick={() => navigate('/os-lab/cpu-scheduling')} 
                variant="ghost" 
                size="sm"
                leftIcon={<Plus size={14} />}
              >
                New Experiment
              </Button>
            </div>

            {loadingExps && experiments.length === 0 ? (
              <div className={styles.loadingBox}>
                <Spinner size="md" />
                <span>Loading saved experiments...</span>
              </div>
            ) : experiments.length > 0 ? (
              <div className={styles.expTableWrapper}>
                <Table>
                  <thead>
                    <tr>
                      <th>Experiment Name</th>
                      <th>Algorithm</th>
                      <th>Saved Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiments.slice(0, 5).map(exp => (
                      <tr 
                        key={exp._id} 
                        onClick={() => handleOpenExp()}
                        className={styles.clickableRow}
                      >
                        <td className={styles.expName}>
                          {exp.input?.name || `${exp.algorithm} Simulation`}
                        </td>
                        <td>
                          <span className={styles.algoTag}>{exp.algorithm}</span>
                        </td>
                        <td className={styles.dateText}>
                          {new Date(exp.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <div className={styles.actionCell}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={(e) => { e.stopPropagation(); handleOpenExp(); }}
                            >
                              Load
                            </Button>
                            <button 
                              onClick={(e) => handleDeleteExp(exp._id, e)} 
                              className={styles.deleteBtn}
                              title="Delete experiment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className={styles.emptyExpState}>
                <Sparkles size={32} className={styles.emptyIcon} />
                <h3>No saved experiments yet</h3>
                <p>Run a CPU scheduling simulation in the laboratory and save it to review results anytime.</p>
                <Button 
                  onClick={() => navigate('/os-lab/cpu-scheduling')} 
                  variant="primary" 
                  size="sm"
                  style={{ marginTop: '1rem' }}
                >
                  Open OS Lab
                </Button>
              </div>
            )}
          </Card>

        </div>

        {/* Sidebar Column: Quick Launch & System Status */}
        <div className={styles.sideCol}>
          
          {/* Quick Launch Cards */}
          <Card className={styles.sectionCard}>
            <h3 className={styles.sideHeader}>Quick Navigation</h3>
            <div className={styles.quickStack}>
              
              <div className={styles.quickTile} onClick={() => navigate('/learn')}>
                <div className={styles.tileIcon} style={{ color: 'var(--color-primary)' }}>
                  <BookOpen size={20} />
                </div>
                <div className={styles.tileInfo}>
                  <div className={styles.tileTitle}>Learn Platform</div>
                  <div className={styles.tileDesc}>Interactive CS lessons</div>
                </div>
                <ArrowRight size={14} className={styles.tileArrow} />
              </div>

              <div className={styles.quickTile} onClick={() => navigate('/mini-os')}>
                <div className={styles.tileIcon} style={{ color: 'var(--color-warning)' }}>
                  <Monitor size={20} />
                </div>
                <div className={styles.tileInfo}>
                  <div className={styles.tileTitle}>Mini-OS Virtual PC</div>
                  <div className={styles.tileDesc}>Simulated UNIX desktop</div>
                </div>
                <ArrowRight size={14} className={styles.tileArrow} />
              </div>

              <div className={styles.quickTile} onClick={() => navigate('/os-lab')}>
                <div className={styles.tileIcon} style={{ color: 'var(--color-success)' }}>
                  <Cpu size={20} />
                </div>
                <div className={styles.tileInfo}>
                  <div className={styles.tileTitle}>OS Laboratory</div>
                  <div className={styles.tileDesc}>CPU Gantt simulator</div>
                </div>
                <ArrowRight size={14} className={styles.tileArrow} />
              </div>

            </div>
          </Card>

          {/* Algorithmic Coverage Checklist */}
          <Card className={styles.sectionCard}>
            <h3 className={styles.sideHeader}>Algorithm Coverage</h3>
            <div className={styles.algoList}>
              <div className={styles.algoItem}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                <span>First Come First Serve (FCFS)</span>
              </div>
              <div className={styles.algoItem}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                <span>Shortest Job First (SJF / SRTF)</span>
              </div>
              <div className={styles.algoItem}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                <span>Priority Scheduling</span>
              </div>
              <div className={styles.algoItem}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                <span>Round Robin (RR)</span>
              </div>
            </div>
          </Card>

        </div>

      </div>

    </div>
  );
};

export default DashboardPage;
