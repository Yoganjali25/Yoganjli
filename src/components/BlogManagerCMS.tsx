import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { BlogPost, BlogCategory } from '../types';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff, 
  FileText, 
  Image as ImageIcon, 
  Sparkles, 
  Calendar, 
  Clock, 
  Tag, 
  CheckCircle2, 
  Upload, 
  X, 
  BookOpen, 
  ExternalLink,
  Share2,
  Search
} from 'lucide-react';

const DEFAULT_CATEGORIES = [
  'Yoga Asanas',
  'Posture & Back Pain',
  'Weight Management',
  'Pranayama & Meditation',
  'Holistic Wellness',
  'Mindful Living'
];

const PRESET_COVERS = [
  { label: 'Studio Shala', url: '/about-anjali.jpg' },
  { label: 'Group Flow', url: '/hero-group-yoga.jpg' },
  { label: 'Sunset Pose', url: '/yoga-pose-sunset.jpg' },
  { label: 'Meditation', url: '/meditation-sanctuary.jpg' },
  { label: 'Trainer Anjali', url: '/anjali-hero.jpg' }
];

export const BlogManagerCMS: React.FC = () => {
  const { blogs, addBlogPost, updateBlogPost, deleteBlogPost, toggleBlogPublish, trainerProfile } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  // Dynamic available categories
  const allCategories = Array.from(new Set([
    ...DEFAULT_CATEGORIES,
    ...(blogs || []).map(b => b.category).filter(Boolean)
  ]));

  // Editor Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<string>('Yoga Asanas');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImage, setCoverImage] = useState('/about-anjali.jpg');
  const [readTime, setReadTime] = useState('5 min read');
  const [tagsString, setTagsString] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [featured, setFeatured] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered list
  const filteredBlogs = blogs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          b.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'All' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const openCreateModal = () => {
    setEditingPost(null);
    setTitle('');
    setSlug('');
    setCategory('Yoga Asanas');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setExcerpt('');
    setContent('');
    setCoverImage('/about-anjali.jpg');
    setReadTime('4 min read');
    setTagsString('Yoga, Health, Daily Routine');
    setIsPublished(true);
    setFeatured(false);
    setIsEditorOpen(true);
  };

  const openEditModal = (post: BlogPost) => {
    setEditingPost(post);
    setTitle(post.title);
    setSlug(post.slug);
    setCategory(post.category);
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setExcerpt(post.excerpt);
    setContent(post.content);
    setCoverImage(post.coverImage);
    setReadTime(post.readTime);
    setTagsString(post.tags.join(', '));
    setIsPublished(post.isPublished);
    setFeatured(!!post.featured);
    setIsEditorOpen(true);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!editingPost) {
      const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      setSlug(autoSlug);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressed = canvas.toDataURL('image/jpeg', 0.85);
            setCoverImage(compressed);
          }
        };
        img.src = base64;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSavePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Please enter both title and article content.');
      return;
    }

    const cleanSlug = (slug.trim() || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `post-${Date.now()}`);
    const tags = tagsString
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const finalCategory = isCustomCategory 
      ? (customCategoryInput.trim() || 'Yoga Asanas')
      : (category || 'Yoga Asanas');

    const postPayload = {
      title: title.trim(),
      slug: cleanSlug,
      category: finalCategory,
      excerpt: excerpt.trim() || content.slice(0, 160) + '...',
      content: content.trim(),
      coverImage,
      author: trainerProfile.name || 'Anjali Negi',
      authorRole: 'Founder & Certified Senior Yoga Instructor',
      authorPhoto: trainerProfile.photoUrl || '/anjali-hero.jpg',
      date: editingPost?.date || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      readTime: readTime || '5 min read',
      tags,
      isPublished,
      featured,
      metaTitle: `${title.trim()} | Yoganjali Studio`,
      metaDescription: excerpt.trim() || content.slice(0, 160)
    };

    if (editingPost) {
      updateBlogPost({
        ...postPayload,
        id: editingPost.id
      });
    } else {
      addBlogPost(postPayload);
    }

    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Filter, Search & New Article Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search articles, tags or topics..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Category Filter Pills & New Article Button */}
        <div className="flex flex-wrap items-center gap-2.5 justify-between md:justify-end">
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-xs sm:max-w-none pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({blogs.length})
            </button>
            {allCategories.slice(0, 3).map(cat => {
              const count = blogs.filter(b => b.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Write Article</span>
          </button>
        </div>
      </div>

      {/* Articles Grid / List */}
      {filteredBlogs.length === 0 ? (
        <div className="text-center py-14 p-6 rounded-3xl bg-white border border-dashed border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">No blog articles found</h4>
          <p className="text-xs text-slate-400">Click the button above to publish your first yoga insights article.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBlogs.map((post) => (
            <div
              key={post.id}
              className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Cover Image & Badges */}
                <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                  
                  {/* Category & Status Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-900/80 text-white text-[10px] font-black backdrop-blur-md border border-white/20">
                      {post.category}
                    </span>
                    {post.featured && (
                      <span className="px-2 py-1 rounded-xl bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-md">
                        ⭐ Featured
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3">
                    <button
                      type="button"
                      onClick={() => toggleBlogPublish(post.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-black backdrop-blur-md flex items-center gap-1 shadow-md transition-all ${
                        post.isPublished
                          ? 'bg-emerald-500/90 text-white border border-emerald-400/40'
                          : 'bg-rose-500/90 text-white border border-rose-400/40'
                      }`}
                      title="Click to toggle live/draft status"
                    >
                      {post.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      <span>{post.isPublished ? 'LIVE' : 'DRAFT'}</span>
                    </button>
                  </div>

                  {/* Date & Read time */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-slate-200 font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-300" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-300" />
                      {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Article Info */}
                <div className="p-5 space-y-2.5">
                  <h4 className="font-serif font-extrabold text-base sm:text-lg text-slate-900 line-clamp-2 leading-snug">
                    {post.title}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-4 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview Article</span>
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(post)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1"
                    title="Edit Blog Post"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete "${post.title}"?`)) {
                        deleteBlogPost(post.id);
                      }
                    }}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fadeIn">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  <Edit3 className="w-5 h-5 text-amber-300" />
                </span>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-white">
                    {editingPost ? 'Edit Blog Article' : 'Write & Publish New Article'}
                  </h3>
                  <p className="text-xs text-emerald-200 font-medium">
                    Google SEO Optimized Article Editor for Yoganjali
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSavePost} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
              
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                  Article Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="e.g. 5 Daily Morning Yoga Asanas for Lower Back Pain Relief"
                  className="w-full px-4 py-2.5 text-sm font-bold rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              {/* URL Slug & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    URL Slug (for clean sharing & SEO)
                  </label>
                  <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-200 px-3 py-2 text-xs">
                    <span className="text-slate-400 select-none">/blog/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="morning-yoga-asanas"
                      className="w-full bg-transparent font-mono font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 block">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(!isCustomCategory);
                        if (!isCustomCategory) {
                          setCustomCategoryInput('');
                        }
                      }}
                      className="text-[11px] font-extrabold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors bg-purple-50 hover:bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isCustomCategory ? 'Pick Existing' : '+ New Category'}</span>
                    </button>
                  </div>

                  {isCustomCategory ? (
                    <div className="space-y-1">
                      <input
                        type="text"
                        autoFocus
                        required
                        value={customCategoryInput}
                        onChange={(e) => setCustomCategoryInput(e.target.value)}
                        placeholder="Type new category (e.g. Prenatal Yoga, Sound Bath)"
                        className="w-full px-3.5 py-2.5 text-xs font-bold rounded-2xl bg-amber-50/80 border-2 border-amber-400 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors text-slate-900"
                      />
                      <p className="text-[10px] text-amber-700 font-semibold pl-1">
                        ✨ New category will automatically appear across filters & website.
                      </p>
                    </div>
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === '__custom__') {
                          setIsCustomCategory(true);
                          setCustomCategoryInput('');
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3.5 py-2.5 text-xs font-bold rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      {allCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="__custom__">✨ + Create New Category...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Cover Image Upload & Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Cover Image</span>
                  <span className="text-[10px] text-slate-400">Upload or Pick Preset</span>
                </label>

                <div className="flex flex-col sm:flex-row items-start gap-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="relative w-28 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                    <img src={coverImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload From Device</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400 self-center">Presets:</span>
                      {PRESET_COVERS.map(p => (
                        <button
                          key={p.label}
                          type="button"
                          onClick={() => setCoverImage(p.url)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors ${
                            coverImage === p.url
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Short Excerpt */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Short Excerpt / Meta Description (Google Preview)
                </label>
                <textarea
                  rows={2}
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="A concise 2-sentence summary that appears on blog cards and Google search snippet..."
                  className="w-full px-3.5 py-2 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Content Body */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider block">
                    Full Article Content <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Supports Markdown: ### Headings, * Bullet points, **Bold**, &gt; Quotes
                  </span>
                </div>
                <textarea
                  rows={10}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your in-depth yoga knowledge, step-by-step poses, breathing cues, and instructor advice here..."
                  className="w-full px-4 py-3 text-xs font-mono rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-purple-500 focus:outline-none transition-colors leading-relaxed"
                />
              </div>

              {/* Tags, Read Time, Publish Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={tagsString}
                    onChange={(e) => setTagsString(e.target.value)}
                    placeholder="Vinyasa, Back Pain, Morning"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600 block">Estimated Read Time</label>
                  <input
                    type="text"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                    placeholder="5 min read"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Publish to Live Website</span>
                  </label>
                </div>
              </div>

              {/* Modal Footer / Submit */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>{editingPost ? 'Save Changes' : 'Publish Article'}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
