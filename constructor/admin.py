from django.contrib import admin
from .models import Furniture, Room, RoomFurniture

@admin.register(Furniture)
class FurnitureAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'category', 'image')
    list_filter = ('category', )
    search_fields = ('name', 'category')

class FurnitureRoomInline(admin.TabularInline):
    model = RoomFurniture
    extra = 1

@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'created_at')
    search_fields = ('name', )
    inlines = [FurnitureRoomInline]

@admin.register(RoomFurniture)
class RoomFurnitureAdmin(admin.ModelAdmin):
    list_display = ('id', 'room', 'furniture', 'x_pos', 'y_pos')
    list_filter = ('room', 'furniture')