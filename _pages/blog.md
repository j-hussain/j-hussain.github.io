---
layout: page
title: Blog
permalink: /blog/
---

Here are my thoughts and updates.

<ul>
  {% for post in site.posts %}
    <li>
      <span>{{ post.date | date_to_string }}</span>: <a href="{{ post.url | prepend: site.baseurl }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>
