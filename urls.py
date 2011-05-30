from django.conf.urls.defaults import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
# Uncomment the next two lines to enable the admin:
from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    #(r'^admin/', include(admin.site.urls)),
    #(r'^$', 'web.views.index'),
    # Examples:
    # url(r'^$', 'Fri.views.home', name='home'),
    # url(r'^Fri/', include('Fri.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/v1/tags/add/', 'Fri.web.views.tag_add'),
    url(r'^api/v1/tags/(?P<tag>[-\w]+)$', 'Fri.web.views.tags_get'),

)
urlpatterns += staticfiles_urlpatterns()
