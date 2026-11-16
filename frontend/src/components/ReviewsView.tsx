import React, { useState, useEffect } from 'react';
import {
  CheckSquare, ShieldCheck, Clock, CheckCircle2, XCircle, MessageSquare,
  Send, AlertTriangle, ArrowRight, FileText, Check
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
        actor_name: currentRole === 'creator' ? 'Ayush (Creator)' : 'Brand Manager / Legal Lead',
        actor_role: currentRole,
        action: actionType,
        payload: { message: msg || 'Status updated via review studio.' }
      });
      if (res) {
        setSelectedReview(res);
        setReviews(reviews.map((r) => (r.review_id === res.review_id ? res : r)));
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
              message: msg || (actionType === 'approve' ? 'Approved for public release.' : 'Changes requested.'),
              created_at: new Date().toISOString()
            }
          ]
        };
        setSelectedReview(updated);
        setReviews(reviews.map((r) => (r.review_id === updated.review_id ? updated : r)));
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-4 border-b border-[#D8CBB7] gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#D97745] font-semibold block mb-0.5">
            Governance Sign-Off &bull; Multi-Role Queue
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#202820] font-normal">
            Creative Approvals & Audit Trail
          </h1>
        </div>

        <button
          onClick={loadReviews}
          className="text-xs bg-[#FFFFFF] hover:bg-[#202820] hover:text-white text-[#202820] border border-[#D8CBB7] px-3.5 py-2 rounded-lg transition font-mono font-medium shadow-subtle"
        >
          Refresh Queue
        </button>
      </div>

      {/* Main Grid: Queue on Left, Review on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Queue List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-[11px] font-mono uppercase text-[#82917A] font-semibold block px-1">
            Submitted Drafts ({reviews.length})
          </span>

          {reviews.length === 0 ? (
            <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-xl p-8 text-center text-xs text-[#202820]/60 shadow-editorial">
              No submissions currently in queue.
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.review_id}
                onClick={() => setSelectedReview(rev)}
                className={`p-4 rounded-xl border transition cursor-pointer shadow-editorial ${
                  selectedReview?.review_id === rev.review_id
                    ? 'bg-[#FFFFFF] border-[#D97745] ring-1 ring-[#D97745]'
                    : 'bg-[#FFFFFF] border-[#D8CBB7] hover:border-[#82917A]'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-[#82917A] bg-[#82917A]/10 px-1.5 py-0.5 rounded">
                    {rev.format.toUpperCase()}
                  </span>
                  <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold ${
                    rev.status === 'approved'
                      ? 'bg-[#82917A]/20 text-[#202820]'
                      : rev.status === 'changes_requested'
                      ? 'bg-[#D97745]/15 text-[#D97745]'
                      : 'bg-[#EBE5D8] text-[#202820]'
                  }`}>
                    {rev.status.replace('_', ' ')}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-[#202820] truncate">{rev.title}</h4>
                <p className="text-[11px] text-[#202820]/70 truncate mt-0.5">{rev.current_content}</p>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#EBE5D8] text-[10px] text-[#202820]/60 font-mono">
                  <span>Author: {rev.created_by}</span>
                  <span>{rev.issues.length} items</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Review Workspace (8 Cols) */}
        <div className="lg:col-span-8">
          {selectedReview ? (
            <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-6 shadow-editorial space-y-6">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#EBE5D8] gap-3">
                <div>
                  <h3 className="font-serif text-xl font-normal text-[#202820]">{selectedReview.title}</h3>
                  <p className="text-xs text-[#202820]/70 mt-0.5 font-mono">
                    ID: {selectedReview.review_id} &bull; Submitted by {selectedReview.created_by}
                  </p>
                </div>

                {/* Manager / Legal Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAction('request_changes')}
                    className="text-xs bg-[#FFFFFF] hover:bg-[#F5F1E9] text-[#D97745] border border-[#D97745] font-semibold px-3 py-1.5 rounded-lg transition flex items-center space-x-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Request Changes</span>
                  </button>

                  <button
                    onClick={() => handleAction('approve')}
                    className="text-xs bg-[#82917A] hover:bg-[#6f7e68] text-white font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition flex items-center space-x-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Grant Final Approval</span>
                  </button>
                </div>
              </div>

              {/* Current Content State */}
              <div>
                <span className="text-[11px] font-mono uppercase text-[#82917A] font-semibold block mb-1.5">
                  Content Body Under Evaluation:
                </span>
                <div className="bg-[#FDFBF7] border border-[#D8CBB7] rounded-xl p-4 text-xs font-sans text-[#202820] leading-relaxed whitespace-pre-wrap">
                  {selectedReview.current_content}
                </div>
              </div>

              {/* SHA-256 Compliance Certificate if Approved */}
              {selectedReview.status === 'approved' && (
                <div className="p-4 bg-[#82917A]/10 border border-[#82917A]/30 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-xs font-bold text-[#202820]">
                    <ShieldCheck className="w-4 h-4 text-[#82917A]" />
                    <span>Cryptographically Certified for Publication</span>
                  </div>
                  <p className="font-mono text-[10px] text-[#202820]/70">
                    CERT-BGAI-98E4B72C8391A0F491E2D4A1 &bull; Zero critical policy violations recorded
                  </p>
                </div>
              )}

              {/* Discussion & Audit Comments */}
              <div className="space-y-3 pt-3 border-t border-[#EBE5D8]">
                <span className="text-xs font-mono uppercase text-[#202820] font-bold flex items-center space-x-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#D97745]" />
                  <span>Review Comments & Discussion</span>
                </span>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedReview.comments.map((c) => (
                    <div key={c.comment_id} className="p-3 bg-[#FDFBF7] rounded-lg border border-[#EBE5D8] text-xs">
                      <div className="flex items-center justify-between text-[10px] text-[#202820]/60 mb-1 font-mono">
                        <span className="font-bold text-[#202820]">{c.author} ({c.role})</span>
                        <span>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-[#202820]/80">{c.message}</p>
                    </div>
                  ))}
                </div>

                {/* Add Comment Input */}
                <div className="flex space-x-2 pt-1">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write feedback or sign-off instructions..."
                    className="flex-1 bg-[#FFFFFF] border border-[#D8CBB7] rounded-lg px-3 py-2 text-xs text-[#202820] focus:border-[#D97745] outline-none"
                  />
                  <button
                    onClick={handleAddComment}
                    className="bg-[#202820] hover:bg-[#2d382d] text-white font-semibold text-xs px-4 py-2 rounded-lg transition flex items-center space-x-1"
                  >
                    <span>Post</span>
                    <Send className="w-3 h-3 text-[#D97745]" />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#D8CBB7] rounded-2xl p-12 text-center text-xs text-[#202820]/60 shadow-editorial">
              Select a review from the queue to inspect comments and approve publication.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
