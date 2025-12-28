---
layout: page
title: Notes | Jabir Hussain
permalink: /notes/
---

Here are my notes from my postgraduate modules:

<ul>
  {% for note in site.notes %}
    {% if note.type == "module" %}
    <li>
      <a href="{{ note.url | prepend: site.baseurl }}">{{ note.title }}</a>
    </li>
    {% endif %}
  {% endfor %}
</ul>
