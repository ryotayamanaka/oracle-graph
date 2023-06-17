import random
import time
import names

num = 5 + 1

fe = open('empnet_employee.csv', "w")
fm = open('empnet_meeting.csv', "w")
fa = open('empnet_attendance.csv', "w")

fe.write('id,first_name,last_name,role,org,suborg,supervisor\n')
fm.write('id,name,datetime\n')
fa.write('id,employee_id,meeting_id\n')

# Employee

def write_employee(id, role, org, suborg, supervisor):
    fe.write(','.join([
        str(id), # ID
        names.get_first_name(),
        names.get_last_name(),
        role,
        org,
        suborg,
        str(supervisor)
        ]) + '\n')

role = "CEO"
org = "n/a"
suborg = "n/a"
supervisor = 0
write_employee(0, role, org, suborg, supervisor)
for i in range(1, num):
    role = "Director"
    org = "dept-" + str(i)
    suborg = "n/a"
    supervisor = 0
    write_employee(i * 100, role, org, suborg, supervisor)
    for j in range(1, num):
        role = "Manager"
        org = "dept-" + str(i)
        suborg = "team-" + str(i) + "-" + str(j)
        supervisor = i * 100
        write_employee(i * 100 + j * 10, role, org, suborg, supervisor)
        for k in range(1, num):
            role = "Member"
            org = "dept-" + str(i)
            suborg = "team-" + str(i) + "-" + str(j)
            supervisor = i * 100 + j * 10
            write_employee(i * 100 + j * 10 + k, role, org, suborg, supervisor)

# Meeting

def random_date(proportion):
    format = '%Y-%m-%d %H:%M:%S'
    stime = time.mktime(time.strptime("2023-03-01 0:00:00", format))
    etime = time.mktime(time.strptime("2023-04-01 0:00:00", format))
    ptime = stime + proportion * (etime - stime)
    return time.strftime(format, time.localtime(ptime))

def write_meeting(id, name):
    fm.write(','.join([
        str(id), # ID
        name,
        random_date(random.random())
        ]) + '\n')

for i in range(1, num):
    write_meeting(i * 100, "director-meeting-" + str(i))
    for j in range(1, num):
        write_meeting(i * 100 + j * 10, "manager-meeting-" + str(i) + "-" + str(j))
        for k in range(1, num):
            write_meeting(i * 100 + j * 10 + k, "member-meeting-" + str(i) + "-" + str(j) + "-" + str(k))

# Attendance

def write_attendance(employee_id, meeting_id):
    fa.write(','.join([
        str(employee_id) + "-" + str(meeting_id), # ID
        str(employee_id), # Employee ID
        str(meeting_id) # Meeting ID
        ]) + '\n')

for i in range(1, num): # director-meeting
    write_attendance(0, i * 100) # CEO attends director meetings
for i in range(1, num): # Directors
    for j in range(1, num): # director-meeting
        write_attendance(i * 100, j * 100) # Directors attend director meetings
    for j in range(1, num): # manager-meeting
        write_attendance(i * 100, i * 100 + j * 10) # Directors attend manager meetings
    for j in range(1, num): # Managers
        for k in range(1, num): # manager-meeting
            write_attendance(i * 100 + j * 10, i * 100 + k * 10) # Managers attend manager meetings
        for k in range(1, num): # member-meeting
            write_attendance(i * 100 + j * 10, i * 100 + j * 10 + k) # Managers attend member meetings
        for k in range(1, num): # Members
            for l in range(1, num): # member-meeting
                write_attendance(i * 100 + j * 10 + k, i * 100 + j * 10 + l) # Members attend member meetings