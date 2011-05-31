from django.conf.urls.defaults import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',

    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/v1/tags/add', 'Fri.web.views.tag_add'),
    url(r'^api/v1/tags/(?P<tag>[-\w]+)$', 'Fri.web.views.tags_get'),
    url(r'^$', 'Fri.web.views.index'),
)
urlpatterns += staticfiles_urlpatterns()
