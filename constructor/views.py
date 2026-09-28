from django.shortcuts import render, get_object_or_404
import json
from django.http import JsonResponse
from .models import Room, Furniture, RoomFurniture

def room_view(request):
    room, created = Room.objects.get_or_create(id=1, defaults={'name': 'Моя комната'})
    furniture_catalog = Furniture.objects.all()
    placed_furniture = RoomFurniture.objects.filter(room=room)
    context = {
        'room': room,
        'furniture_catalog': furniture_catalog,
        'placed_furniture': placed_furniture
    }
    return render(request, 'constructor/room.html', context)

def room_save(request, room_id):
    if request.method == 'POST':
        room = get_object_or_404(Room, id=room_id)
        try:
            data = json.loads(request.body)
            items = data.get('items', [])
            RoomFurniture.objects.filter(room=room).delete() #удаляем старое расположение комнаты, чтобы запистаь новое
            for item in items:
                furniture_id = items.get('furniture_id')
                x = item.get('x', 0)
                y = item.get('y', 0)
                furniture = Furniture.objects.get(id=furniture_id)
                RoomFurniture.objects.create(
                    room = room,
                    furniture = furniture,
                    x_pos = x,
                    y_pos = y
                )
            return JsonResponse({'status': 'success', 'message': 'Комната сохранена'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    return JsonResponse({'status': 'error', 'message': 'Недопустимый метод'})