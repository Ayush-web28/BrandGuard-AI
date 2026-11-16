import React, { useState, useEffect } from 'react';
import {
  UserCheck, ShieldCheck, Clock, CheckCircle2, XCircle, MessageSquare,
  History, ArrowRight, Send, AlertTriangle
} from 'lucide-react';
import { ReviewRecord, ReviewerRole, ReviewStatus } from '../types';
import { fetchReviews, postReviewAction } from '../lib/api';

interface ReviewsViewProps {
  currentRole: ReviewerRole;
  selectedBrandId: string;
}

export const ReviewsView: React.FC<ReviewsViewProps> = ({ currentRole, selectedBrandId }) => {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null);
  const [newComment, setNewComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    loadReviews();
  }, [selectedBrandId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const data = await fetchReviews();
      setReviews(data);
      if (data.length > 0 && !selectedReview) {
        setSelectedReview(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (actionType: string, msg?: string) => {
    if (!selectedReview) return;
    try {
      const res = await postReviewAction(selectedReview.review_id, {
        actor_name: currentRole === 'creator' ? 'Ayush (Creator)' : 'Brand Lead / Compliance',
        actor_role: currentRole,
        action: actionType,
        payload: { message: msg || 'Status updated via review studio.' }
      });
      if (res) {
        setSelectedReview(res);
        setReviews(reviews.map(r => r.review_id === res.review_id ? res : r));
      } else {
        // Fallback local update
        const updated: ReviewRecord = {
          ...selectedReview,
          status: actionType === 'approve' ? 'approved' : 'changes_requested',
          comments: [
            ...selectedReview.comments,
            {
              comment_id: `COM-${Date.now()}`,
              author: currentRole === 'creator' ? 'Ayush' : 'Reviewer Lead',
              role: currentRole,
              message: msg || (actionType === 'approve' ? 'Approved for publication.' : 'Changes requested.'),
              created_at: new Date().toISOString()
            }
          ]
        };
        setSelectedReview(updated);
        setReviews(reviews.map(r => r.review_id === updated.review_id ? updated : r));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim() || !selectedReview) return;
    handleAction('add_comment', newComment);
    setNewComment('');
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400">
              Role-Based Governance Handoff
            </span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono">
              Active Role: {currentRole.replace('_', ' ').toUpperCase()}
            </span>
          </div>
          <h2 className="text-xl font-black text-white">Collaborative Pre-Publication Review Queue</h2>
          <p className="text-xs text-slate-400">
            Creators, Brand Managers, and Legal Officers collaborate with full revision history before public publishing.
          </p>
        </div>

        <button
          onClick={loadReviews}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition"
        >
          Refresh Queue
        </button>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Queue List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Submitted Drafts ({reviews.length})
          </div>

          {reviews.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
              No drafts in queue. Run a pre-flight scan in the Studio to create one!
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.review_id}
                onClick={() => setSelectedReview(rev)}
                className={`p-3.5 rounded-xl border cursor-pointer transition ${
                  selectedReview?.review_id === rev.review_id
                    ? 'bg-slate-800/90 border-indigo-500 shadow-md'
                    : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-400">{rev.review_id}</span>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    rev.status === 'approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : rev.status === 'changes_requested'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {rev.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-slate-200 truncate">{rev.title}</h4>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{rev.current_content}</p>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
                  <span>By {rev.created_by}</span>
                  <span>{rev.issues.length} flagged issues</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Selected Review Workspace (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedReview ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              
              {/* Review Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white">{selectedReview.title}</h3>
                    <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                      {selectedReview.format.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Created by {selectedReview.created_by} &bull; Last updated {new Date(selectedReview.last_updated).toLocaleTimeString()}
                  </p>
                </div>

                {/* Manager / Legal Approval Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAction('request_changes')}
                    className="text-xs bg-amber-600/20 text-amber-300 border border-amber-500/30 hover:bg-amber-600/30 font-semibold px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>

                  <button
                    onClick={() => handleAction('approve')}
                    className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-lg shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Grant Final Approval</span>
                  </button>
                </div>
              </div>

              {/* Current Content Canvas */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Current Draft State
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-sans text-slate-200 leading-relaxed">
                  {selectedReview.current_content}
                </div>
              </div>

              {/* Flagged Issues In Review */}
              {selectedReview.issues.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Flagged Policy Items ({selectedReview.issues.length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedReview.issues.map((i) => (
                      <div key={i.issue_id} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{i.title}</span>
                          <span className="text-[9px] text-indigo-400 font-mono">{i.rule_id}</span>
                        </div>
                        <p className="text-slate-400 truncate">{i.suggested_fix}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments & Discussion Thread */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Review Comments & Discussion</span>
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedReview.comments.map((c) => (
                    <div key={c.comment_id} className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                        <span className="font-bold text-slate-300">{c.author} ({c.role})</span>
                        <span>{new Date(c.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300">{c.message}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment Input */}
                <div className="flex space-x-2 pt-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add feedback or instruction..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:border-indigo-500"
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                  >
                    <span>Post</span>
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-xs text-slate-500">
              Select a review from the queue to inspect comments and approve publication.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
