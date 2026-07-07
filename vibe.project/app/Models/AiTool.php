<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiTool extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'how_to_use',
        'url',
        'logo_url',
        'documentation_url',
        'video_url',
        'difficulty',
        'is_active',
        'is_free',
        'status',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_free'   => 'boolean',
    ];

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class, 'ai_tool_category');
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'ai_tool_role');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'ai_tool_tag');
    }

    public function examples(): HasMany
    {
        return $this->hasMany(ToolExample::class)->orderBy('sort_order');
    }
}
